# GitHub Secrets Setup for ReviewPlus CI/CD

Go to: **https://github.com/parthsantosh2411/ReviewPlus/settings/secrets/actions**

Click **"New repository secret"** and add these 4 secrets:

| Secret Name | Value | Where to find it |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | AWS Console → IAM → Users → itc-camp-user1 → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | Same as above (only shown once at creation) |
| `REACT_APP_API_URL` | `https://oj6pwu8j86.execute-api.ca-central-1.amazonaws.com/dev` | `terraform output api_gateway_url` |
| `FRONTEND_BUCKET_NAME` | `reviewpulse-frontend-f020c3de` | `terraform output frontend_bucket` |

---

## After adding secrets

Push any commit to `main` to trigger the pipeline:

```bash
git add .
git commit -m "feat: add GitHub Actions CI/CD pipeline"
git push origin main
```

## Watch the pipeline

Live at: https://github.com/parthsantosh2411/ReviewPlus/actions

### Pipeline Jobs (4 stages)

| Job | What it does | Trigger |
|---|---|---|
| **test** | Validates Python syntax + builds React | Every push to main |
| **deploy-backend** | Zips & deploys all 4 Lambda functions | After test passes |
| **deploy-frontend** | Builds React & syncs to S3 | After test passes |
| **summary** | Prints deployment info | After both deploys |

> **Note:** `deploy-backend` and `deploy-frontend` run **in parallel** after `test` passes for faster deployment.
