import boto3
import json
import subprocess
import os

# Get user pool ID from terraform output
result = subprocess.run(
    ['terraform', 'output', '-raw', 'cognito_user_pool_id'],
    capture_output=True, text=True, cwd='terraform'
)
user_pool_id = result.stdout.strip()
print(f"User Pool ID: {user_pool_id}")

client_result = subprocess.run(
    ['terraform', 'output', '-raw', 'cognito_client_id'],
    capture_output=True, text=True, cwd='terraform'
)
client_id = client_result.stdout.strip()
print(f"Client ID: {client_id}")

cognito = boto3.client('cognito-idp', region_name='ca-central-1')

# Step 1 — Create the admin user
try:
    cognito.admin_create_user(
        UserPoolId=user_pool_id,
        Username='tripathiparth2411@gmail.com',
        UserAttributes=[
            {'Name': 'email',              'Value': 'tripathiparth2411@gmail.com'},
            {'Name': 'email_verified',     'Value': 'true'},
            {'Name': 'phone_number',       'Value': '+918237407325'},
            {'Name': 'phone_number_verified', 'Value': 'true'},
            {'Name': 'custom:role',        'Value': 'admin'},
            {'Name': 'custom:brandId',     'Value': 'brand-001'},
        ],
        TemporaryPassword='TempPass@123',
        MessageAction='SUPPRESS'
    )
    print("User created in Cognito")
except cognito.exceptions.UsernameExistsException:
    print("User already exists — updating attributes")

# Step 2 — Set permanent password (skip force change)
cognito.admin_set_user_password(
    UserPoolId=user_pool_id,
    Username='tripathiparth2411@gmail.com',
    Password='Admin@123!',
    Permanent=True
)
print("Permanent password set")

# Step 3 — Add user to admin group
cognito.admin_add_user_to_group(
    UserPoolId=user_pool_id,
    Username='tripathiparth2411@gmail.com',
    GroupName='admin'
)
print("User added to admin group")

# Step 4 — Enable SMS MFA for this user
cognito.admin_set_user_mfa_preference(
    UserPoolId=user_pool_id,
    Username='tripathiparth2411@gmail.com',
    SMSMfaSettings={
        'Enabled': True,
        'PreferredMfa': True
    }
)
print("SMS MFA enabled")

print("")
print("================================================")
print("  Cognito Admin User Created!")
print("================================================")
print(f"  Email:    tripathiparth2411@gmail.com")
print(f"  Password: Admin@123!")
print(f"  Phone:    +918237407325")
print(f"  MFA:      SMS OTP to phone")
print(f"  Role:     admin")
print(f"  Brand:    brand-001 (TechGear Pro)")
print("================================================")
print("  On login: OTP SMS will be sent to +918237407325")
print("================================================")
