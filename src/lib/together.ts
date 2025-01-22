// API endpoints
const API_BASE_URL = 'http://localhost:3000/api';

export const generateTask = async (subject: string, difficulty: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, difficulty }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Parse the content from the streaming response
    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : data.content;
    const parsedContent = JSON.parse(jsonStr);

    // Validate the parsed content
    if (!parsedContent.title || !parsedContent.description || !parsedContent.starterCode) {
      throw new Error('Invalid challenge format');
    }

    return parsedContent;
  } catch (error) {
    console.error('AI generation failed:', error);
    // Return fallback challenge
    return defaultChallenges[subject as keyof typeof defaultChallenges][difficulty as 'easy' | 'medium' | 'hard'];
  }
};

export const evaluateCode = async (task: any, code: string, cssCode?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, code, cssCode }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Assume the API response is already JSON
    if (
      isNaN(Number(data.score)) || // Ensure the score can be converted to a number
      !data.feedback ||
      !Array.isArray(data.suggestions)
    ) {
      console.warn('Unexpected response format:', data);
      throw new Error('Invalid evaluation format');
    }
    
    // Convert the score to a number before returning the response
    return {
      ...data,
      score: Number(data.score), // Ensure score is a number
    };
  } catch (error) {
    console.error('Evaluation failed:', error);
    return {
      score: 0,
      feedback: "Unable to evaluate code at this time. Please try again later.",
      suggestions: [
        "Check your code syntax",
        "Ensure your solution matches the requirements",
        "Try again in a few moments"
      ]
    };
  }
};

// Keep the default challenges for fallback
const defaultChallenges = {
  html: {
    easy: {
      title: 'Create a Navigation Menu',
      description: 'Create a responsive navigation menu with 4 links that stack vertically on mobile devices.',
      difficulty: 'easy',
      subject: 'html',
      starterCode: '<nav>\n  <!-- Your code here -->\n</nav>'
    },
    medium: {
      title: 'Build a Contact Form',
      description: 'Create a contact form with name, email, and message fields.',
      difficulty: 'medium',
      subject: 'html',
      starterCode: '<form>\n  <!-- Your code here -->\n</form>'
    },
    hard: {
      title: 'Create a Complex Layout',
      description: 'Build a responsive grid layout with header, sidebar, main content, and footer.',
      difficulty: 'hard',
      subject: 'html',
      starterCode: '<div class="layout">\n  <!-- Your code here -->\n</div>'
    }
  },
  css: {
    easy: {
      title: 'Style a Button',
      description: 'Create a stylish button with hover effects.',
      difficulty: 'easy',
      subject: 'css',
      starterCode: '.button {\n  /* Your styles here */\n}'
    },
    medium: {
      title: 'Create a Card Component',
      description: 'Style a card component with image, title, and description.',
      difficulty: 'medium',
      subject: 'css',
      starterCode: '.card {\n  /* Your styles here */\n}'
    },
    hard: {
      title: 'Implement Dark Mode',
      description: 'Create a dark mode theme with smooth transitions.',
      difficulty: 'hard',
      subject: 'css',
      starterCode: ':root {\n  /* Your variables here */\n}'
    }
  },
  flask: {
    easy: {
      title: 'Hello World Route',
      description: 'Create a simple Flask route that returns "Hello, World!"',
      difficulty: 'easy',
      subject: 'flask',
      starterCode: 'from flask import Flask\n\napp = Flask(__name__)\n\n# Your code here'
    },
    medium: {
      title: 'REST API Endpoint',
      description: 'Create a REST API endpoint that handles GET and POST requests.',
      difficulty: 'medium',
      subject: 'flask',
      starterCode: 'from flask import Flask, request\n\napp = Flask(__name__)\n\n# Your code here'
    },
    hard: {
      title: 'Database Integration',
      description: 'Create a Flask route that interacts with a database.',
      difficulty: 'hard',
      subject: 'flask',
      starterCode: 'from flask import Flask\nfrom flask_sqlalchemy import SQLAlchemy\n\n# Your code here'
    }
  },
  sqlite: {
    easy: {
      title: 'Create Table',
      description: 'Create a table for storing user information.',
      difficulty: 'easy',
      subject: 'sqlite',
      starterCode: 'CREATE TABLE users (\n  -- Your schema here\n);'
    },
    medium: {
      title: 'Complex Queries',
      description: 'Write a query to join multiple tables and filter results.',
      difficulty: 'medium',
      subject: 'sqlite',
      starterCode: 'SELECT *\nFROM table1\n-- Your join conditions here'
    },
    hard: {
      title: 'Optimize Performance',
      description: 'Optimize a slow query using indexes and proper join strategies.',
      difficulty: 'hard',
      subject: 'sqlite',
      starterCode: '-- Create indexes and write your optimized query here'
    }
  }
};