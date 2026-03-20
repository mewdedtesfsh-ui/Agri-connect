import { useState, useEffect } from 'react';
import axios from 'axios';
import FarmerLayout from '../components/FarmerLayout';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const FarmerQuestions = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ question: '', category: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/farmers/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const response = await axios.get(`/api/farmers/questions/${questionId}/answers`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    fetchAnswers(question.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/farmers/questions', formData);
      setFormData({ question: '', category: '' });
      setShowForm(false);
      fetchQuestions();
      toast.success(t('messages.submitSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.errorOccurred'));
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.category && question.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('questions.myQuestions')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
          >
            {showForm ? t('common.cancel') : t('questions.askQuestion')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t('questions.askQuestion')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('questions.categoryOptional')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t('questions.categoryPlaceholder')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">{t('questions.yourQuestion')}</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="5"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder={t('questions.questionPlaceholder')}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary"
              >
                {t('questions.postQuestion')}
              </button>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">{t('questions.searchQuestions')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('questions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">{t('questions.filterByStatus')}</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('questions.allStatus')}</option>
              <option value="pending">{t('dynamic.status.pending')}</option>
              <option value="answered">{t('dynamic.status.answered')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Questions List */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('questions.yourQuestions')}</h2>
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  onClick={() => handleSelectQuestion(question)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition ${
                    selectedQuestion?.id === question.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    {question.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {t(`dynamic.categories.${question.category.toLowerCase()}`)}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-sm ${
                      question.status === 'pending' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {t(`dynamic.status.${question.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <p className="text-gray-700">{question.question}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(question.created_at).toLocaleString()} • {question.answer_count} {t('questions.answers')}
                  </p>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('questions.noMatchingQuestions') 
                    : t('questions.noQuestionsYet')}
                </div>
              )}
            </div>
          </div>

          {/* Question Detail & Answers */}
          <div>
            {selectedQuestion ? (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('questions.questionAndAnswers')}</h2>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <p className="text-gray-700 mb-4">{selectedQuestion.question}</p>
                  <p className="text-sm text-gray-500">
                    {t('questions.askedOn')} {new Date(selectedQuestion.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Answers */}
                {answers.length > 0 ? (
                  <div>
                    <h3 className="font-bold mb-3">{t('questions.answersFromOfficers')}</h3>
                    <div className="space-y-4">
                      {answers.map((answer) => (
                        <div key={answer.id} className="bg-white rounded-lg shadow-md p-6">
                          <p className="text-sm font-semibold text-primary mb-2">
                            {answer.officer_name}
                          </p>
                          <p className="text-gray-700 whitespace-pre-wrap">{answer.answer}</p>
                          <p className="text-xs text-gray-500 mt-3">
                            {new Date(answer.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                    {t('questions.noAnswersYet')}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                {t('questions.selectQuestion')}
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default FarmerQuestions;
