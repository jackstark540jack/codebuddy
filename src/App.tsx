import React, { useState } from 'react';
import { Code2, Play, CheckCircle, Lightbulb, BookOpen, Trophy, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { generateTask, evaluateCode } from './lib/together';

type Subject = 'html' | 'css' | 'flask' | 'sqlite';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Challenge {
  title: string;
  description: string;
  difficulty: Difficulty;
  subject: Subject;
  starterCode: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  suggestions: string[];
  solution?: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [subject, setSubject] = useState<Subject>('html');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const generateChallenge = async () => {
    try {
      setLoading(true);
      const task = await generateTask(subject, difficulty);
      setChallenge(task);
      setCode(task.starterCode);
      setCssCode('');
      setEvaluation(null);
    } catch (error) {
      console.error('Error generating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
  if (!challenge) return;

  try {
    setLoading(true);
    const result = await evaluateCode(challenge, code, subject === 'css' ? cssCode : undefined);

    // Ensure the result matches the Evaluation interface
    if (
      typeof result.score === 'number' &&
      typeof result.feedback === 'string' &&
      Array.isArray(result.suggestions)
    ) {
      setEvaluation(result);
    } else {
      console.error('Invalid API Response Structure:', result);
    }
  } catch (error) {
    console.error('Error evaluating code:', error);
  } finally {
    setLoading(false);
  }
};


  const renderPreview = () => {
    if (subject === 'html') {
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: `
              <style>${cssCode}</style>
              ${code}
            ` 
          }} 
        />
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-indigo-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'} p-2 rounded-lg`}>
                <Code2 className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                CodeBuddy
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Points: 0</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Completed: 0</span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors duration-200`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-xl shadow-sm p-6 mb-6 border`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            Choose Your Challenge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                What would you like to learn?
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-indigo-500' 
                    : 'border-gray-200 focus:border-indigo-500'
                } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="flask">Flask</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                How challenging should it be?
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-indigo-500' 
                    : 'border-gray-200 focus:border-indigo-500'
                } focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
              >
                <option value="easy">Beginner Friendly</option>
                <option value="medium">Getting Tougher</option>
                <option value="hard">Expert Level</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateChallenge}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Generating...' : 'Start Learning'}</span>
                <Play className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {challenge && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge Description */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-xl shadow-sm p-6 border`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {challenge.title}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {difficulty === 'easy' ? '🌱 Beginner Friendly' :
                       difficulty === 'medium' ? '🚀 Intermediate' :
                       '⭐ Advanced'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                      {subject.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="prose prose-indigo">
                <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {challenge.description}
                </p>
                <div className={`mt-4 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    💡 Helpful Tips
                  </h3>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}`}>
                    <li>Break down the problem into smaller steps</li>
                    <li>Test your solution as you go</li>
                    <li>Don't hesitate to use the "Evaluate" button to check your progress</li>
                  </ul>
                </div>
              </div>
              {evaluation && (
  <div className={`mt-6 p-4 rounded-lg ${
    evaluation.score >= 80 ? 'bg-green-100 border-green-200' :
    evaluation.score >= 60 ? 'bg-yellow-100 border-yellow-200' :
    'bg-red-100 border-red-200'
  }`}>
    <h3 className="text-lg font-semibold mb-2">Evaluation Results</h3>
    <div className="space-y-3">
      <div className="flex items-center">
        <div className="text-2xl font-bold">{evaluation.score || 0}/100</div>
      </div>
      <p className="text-sm">{evaluation.feedback || 'Unable to evaluate code at this time. Please try again later.'}</p>
      
      {evaluation.suggestions.length > 0 && (
        <div>
          <h4 className="font-medium mb-1">Suggestions for Improvement:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      {evaluation?.solution && (
  <div className="mt-6 p-4 rounded-lg bg-blue-100 border-blue-200">
  <h3 className="text-lg font-semibold mb-2">Correct Solution</h3>
  <pre className="text-sm bg-gray-200 p-4 rounded-lg whitespace-pre-wrap">
    {evaluation.solution}
  </pre>
</div>
)}

    </div>
  </div>
)}

            </div>

            {/* IDE and Preview */}
            <div className="space-y-6">
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-xl shadow-sm p-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <Code2 className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    {subject === 'css' ? 'HTML Template' : 'Your Code'}
                  </h3>
                  <button
                    onClick={handleEvaluate}
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    } transition-colors duration-200`}
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Evaluate Code
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full h-64 font-mono text-sm p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                    placeholder="Type your code here..."
                  />
                </div>
              </div>

              {subject === 'css' && (
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-xl shadow-sm p-6 border`}>
                  <h3 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <Code2 className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    CSS Styles
                  </h3>
                  <div className="relative">
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      className={`w-full h-48 font-mono text-sm p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200`}
                      placeholder="Enter your CSS styles here..."
                    />
                  </div>
                </div>
              )}

              {(subject === 'html' || subject === 'css') && (
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} rounded-xl shadow-sm p-6 border`}>
                  <h3 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <Play className="h-5 w-5 text-green-500 mr-2" />
                    Live Preview
                  </h3>
                  <div className={`border rounded-lg p-4 h-48 overflow-auto ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {renderPreview()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;