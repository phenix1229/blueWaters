Hello and thank you for taking the time to look at my project.

This is my midterm project for term 2 of the Web Development immersive program at [Code Immersives](https://www.codeimmersives.com/#). It is built with Nodejs, Express, and  MongoDB using the MVC framework (with EJS as the view) and is fully responsive.

I decided to expand on the bank account tracker I created for my final project of term 1 (view [here](https://github.com/phenix1229/final-project)). This is a standalone app, so it does not connect to an actual bank or account, but it can act as a sort of ledger for transactions such as debits, credits, and transfers as it simulates these features and more. 

Updates on this version include:
- User registration and login
- Ability to update user profile (including password)
- Ability to send money between users
- Ability to generate and delete statements
- View statements as PDFs (available options for printing and downloading)
- MongoDB storage (as opposed to local storage in the original)

## Usage

From the home/start page choose whether to login (account already created) or register (new user).

Once registered or logged in, you will be brought to an page with all available options listed.

### Checking
- View checking account transaction history
### Savings
- View savings account transaction history
### Transfer
- Transfer funds between savings and checking accounts
### Deposit / Withdraw
- Add or remove funds from checking and savings accounts
### Send Money
- Send money from your checking or savings account to another user
### Statements
- Generate, view, delete statements for your accounts
### Profile
- View and edit your profile
### Logout
- End your session


The following video demonstrates how each feature works:

[![video](http://img.youtube.com/vi/nKYmAuzL6JY/0.jpg)](http://www.youtube.com/watch?v=nKYmAuzL6JY "My Bank demo")

## Built with
- MongoDB
- Express
- Nodejs
- EJS

Thank you again for stopping by.