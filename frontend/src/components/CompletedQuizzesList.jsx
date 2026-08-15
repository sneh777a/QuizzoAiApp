import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

const CompletedQuizzesList = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCompletedQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/quiz/my-completed-quizzes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setCompletedQuizzes(response.data.data);
        } else {
          setError('Failed to fetch completed quizzes');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching your completed quizzes');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompletedQuizzes();
    }
  }, [token]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your completed quizzes...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" my={4}>
        <AlertIcon />
        <AlertTitle mr={2}>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (completedQuizzes.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg">You haven't completed any quizzes yet.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>My Completed Quizzes</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Topic</Th>
              <Th isNumeric>Questions</Th>
              <Th>Difficulty</Th>
              <Th isNumeric>Time Limit</Th>
              <Th>Scheduled For</Th>
              <Th isNumeric>Score</Th>
              <Th isNumeric>Correct</Th>
              <Th isNumeric>Incorrect</Th>
              <Th>Completed At</Th>
            </Tr>
          </Thead>
          <Tbody>
            {completedQuizzes.map((quiz) => (
              <Tr key={quiz.quizId}>
                <Td fontWeight="medium">{quiz.topicName}</Td>
                <Td isNumeric>{quiz.numberOfQuestions}</Td>
                <Td>
                  <Badge colorScheme={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </Td>
                <Td isNumeric>{Math.floor(quiz.totalTimeLimit / 60)} min</Td>
                <Td>{formatDate(quiz.scheduledFor)}</Td>
                <Td isNumeric fontWeight="bold">{quiz.totalScore}</Td>
                <Td isNumeric color="green.500">{quiz.correctAnswers}</Td>
                <Td isNumeric color="red.500">{quiz.incorrectAnswers}</Td>
                <Td>{formatDate(quiz.completedAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CompletedQuizzesList;