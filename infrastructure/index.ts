import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as path from "path";

function getContentType(fileName: string): string {

    if (fileName.endsWith(".html")) return "text/html";

    if (fileName.endsWith(".css")) return "text/css";

    if (fileName.endsWith(".js")) return "application/javascript";

    if (fileName.endsWith(".json")) return "application/json";

    if (fileName.endsWith(".png")) return "image/png";

    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";

    if (fileName.endsWith(".svg")) return "image/svg+xml";

    return "application/octet-stream";

}


// Your existing bucket (reuse it)
const bucket = new aws.s3.Bucket("frontend-bucket", {
    bucket: "final-project-cloud-course",
    website: {
        indexDocument: "index.html",
    },
});

// Make bucket public (required for website access)
new aws.s3.BucketPolicy("bucket-policy", {
    bucket: bucket.id,
    policy: bucket.id.apply(bucketName =>
        JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${bucketName}/*`
                }
            ]
        })
    ),
});

// Upload build files
const buildDir = "../frontend/build";

function uploadDirectory(dir: string) {
    function walk(currentDir: string) {
        const files = fs.readdirSync(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                walk(filePath);
            } else {
                const relativePath = filePath.replace(buildDir + "/", "");

                new aws.s3.BucketObject(relativePath, {
                    bucket: bucket,
                    key: relativePath,
                    source: new pulumi.asset.FileAsset(filePath),
                    contentType: getContentType(filePath),
                });
            }
        }
    }

    walk(dir);
}

uploadDirectory(buildDir);

// Export website URL
export const websiteUrl = bucket.websiteEndpoint;

const backendSg = new aws.ec2.SecurityGroup("backend-sg", {
    description: "Allow backend traffic",
    ingress: [
        {
            protocol: "tcp",
            fromPort: 3001,
            toPort: 3001,
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            protocol: "tcp",
            fromPort: 22,
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"],
        }
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        }
    ],
});

const backendInstance = new aws.ec2.Instance("backend-instance", {
    ami: "ami-0c02fb55956c7d316", // Amazon Linux 2 (us-east-1)
    instanceType: "t3.micro",

    vpcSecurityGroupIds: [backendSg.id],

    associatePublicIpAddress: true,

    userData: `#!/bin/bash
yum update -y
yum install -y docker
service docker start
usermod -a -G docker ec2-user
`,

    tags: {
        Name: "backend-instance"
    }
});