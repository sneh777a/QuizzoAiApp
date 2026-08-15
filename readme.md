Live quiz Web app:
#technology: MERN stack and other required libraries to build the app
#App Layout:

- Login Page Features:
  • Modern login/signup form with:
  o Email & Password authentication
  o Forgot Password
  • Toggle between light/dark mode
  • Clean UI
- Main app
  • Sidebar (Left panel): Contains 2 options

1. Dashboard
    Central hub displaying shortcuts to all features.
    Overview of recent quizzes results & performance graphs.
2. Quizzes
    User can create a quiz. View already created quiz to copy the quiz id or edit the quiz room.
    User can join a quiz
    A waiting page screen if user joins the room before starting of the quiz.

** Core features/ flow **
#creating the quiz room (inside quizzes tab): Live quiz application, where one user can create a quiz room with some options:
 Based on Book/ Based on Topic
 Sub topic (optional)
 Number of questions
 Difficulty (easy, medium, hard)
 Time per question
 Start date & time
Then user can click on “Create” button, clicking on create button AI will generate the quiz with answers based on the quiz options and stores in the DB. After successfully creation of the quiz room, user gets a quiz Id in response. This quiz Id will be required to join the quiz for other users including the creator.

#Factors: The quiz should be start automatically on the scheduled time. User can’t start the quiz. Use cron job start the quiz automatically. Users can’t join the room after starting of the quiz

#joining the quiz room (inside quizzes tab): User can enter the quiz Id to join the room. If any of the user (or multiple users) join the room before the starting time then they should be on a waiting page where a quiz start time should be present, users list (names) those are inside the waiting page and other details like Creator’s name of quiz room, quiz’s topic, sub topics etc. Once the timer ends
#staring of the quiz:
• Left side:
o Question
o Multiple choice options (radio/select)
• Right side:
o Timer
o Total participants
o No. of participants answered
o No. of participants answered correctly
o Next Button
** Make sure to handle real time updates using Web socket featuring the above features **
