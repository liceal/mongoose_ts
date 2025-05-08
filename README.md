npx --yes migrate create add_users --dbConnectionUri mongodb://127.0.0.1:27017/my_test

npx --yes migrate create remove_email_index -d mongodb://127.0.0.1:27017/my_test

npx migrate up remove_email_index -d mongodb://127.0.0.1:27017/my_test
