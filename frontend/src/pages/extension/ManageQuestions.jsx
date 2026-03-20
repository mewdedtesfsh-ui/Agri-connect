import { useState, useEffect } from 'react';
import axios from 'axios';
import ExtensionLayout from '../../components/ExtensionLayout';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';

const ManageQuestions = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/extension/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const response = await axios.get(`/api/extension/questions/${questionId}/answers`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    fetchAnswers(question.id);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/extension/answers', {
        question_id: selectedQuestion.id,
        answer: answerText
      });
      setAnswerText('');
      fetchAnswers(selectedQuestion.id);
      fetchQuestions();
      toast.success(t('messages.submitSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.errorOccurred'));
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.category && question.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ExtensionLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </ExtensionLayout>
    );
  }

  return (
    <ExtensionLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('questions.farmerQuestions')}</h1>

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">{t('questions.searchQuestions')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('questions.searchPlaceholder2')}
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
            <h2 className="text-xl font-bold mb-4">{t('questions.allQuestions')}</h2>
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
                    <div>
                      <p className="font-semibold">{question.farmer_name}</p>
                      <p className="text-sm text-gray-500">{t(`dynamic.regions.${question.farmer_location.toLowerCase()}`)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      question.status === 'pending' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {t(`dynamic.status.${question.status.toLowerCase()}`)}
                    </span>
                  </div>
                  {question.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                      {t(`dynamic.categories.${question.category.toLowerCase()}`)}
                    </span>
                  )}
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
                    : t('questions.noQuestionsAvailable')}
                </div>
              )}
            </div>
          </div>

          {/* Question Detail & Answer Form */}
          <div>
            {selectedQuestion ? (
              <div>
                <h2 className="text-xl font-bold mb-4">{t('questions.questionDetails')}</h2>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <p className="font-semibold mb-2">{selectedQuestion.farmer_name}</p>
                  <p className="text-gray-700 mb-4">{selectedQuestion.question}</p>
                  <p className="text-sm text-gray-500">
                    {t('questions.askedOn')} {new Date(selectedQuestion.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Existing Answers */}
                {answers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">{t('questions.previousAnswers')}</h3>
                    <div className="space-y-3">
                      {answers.map((answer) => (
                        <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            {answer.officer_name}
                          </p>
                          <p className="text-gray-700">{answer.answer}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(answer.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold mb-4">{t('questions.postYourAnswer')}</h3>
                  <form onSubmit={handleSubmitAnswer}>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                      rows="6"
                      placeholder={t('questions.answerPlaceholder')}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary"
                    >
                      {t('questions.postAnswer')}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                {t('questions.selectQuestionToView')}
              </div>
            )}
          </div>
        </div>
      </div>
    </ExtensionLayout>
  );
};

export default ManageQuestions;
