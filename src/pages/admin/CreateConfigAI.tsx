import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/common/Header";
import {
  useCreateAIConfiguration,
  CreateAIConfigurationRequest,
} from "../../services/chatboxService";

interface FormErrors {
  modelName?: string;
  displayName?: string;
  temperature?: string;
  topP?: string;
  maxTokens?: string;
  systemPrompt?: string;
  isFree?: string;
}

const CreateConfigAI: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAIConfiguration();

  const [formData, setFormData] = useState<CreateAIConfigurationRequest>({
    modelName: "",
    displayName: "",
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 8000,
    systemPrompt: "",
    isFree: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.modelName.trim()) {
      newErrors.modelName = "Model name is required";
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = "Temperature must be between 0 and 2";
    }

    if (formData.topP < 0 || formData.topP > 1) {
      newErrors.topP = "Top P must be between 0 and 1";
    }

    if (formData.maxTokens < 1 || formData.maxTokens > 100000) {
      newErrors.maxTokens = "Max tokens must be between 1 and 100,000";
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = "System prompt is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success("AI configuration created successfully!");
      navigate("/admin/config-ai");
    } catch (error: any) {
      toast.error(error.message || "Failed to create AI configuration");
    }
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Create AI Configuration" />

      <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/config-ai"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 transition-colors bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configurations
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-100">
                Create New AI Configuration
              </h1>
              <p className="text-gray-400">
                Configure a new AI model for the chatbox
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="modelName"
                  className="block mb-2 text-sm font-medium text-gray-300"
                >
                  Model Name *
                </label>
                <input
                  type="text"
                  id="modelName"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleInputChange}
                  placeholder="e.g., meta-llama/llama-3.3-70b-instruct:free"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 ${
                    errors.modelName ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.modelName && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.modelName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="displayName"
                  className="block mb-2 text-sm font-medium text-gray-300"
                >
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="e.g., Meta Llama 3.3 70B (Free)"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 ${
                    errors.displayName ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.displayName && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.displayName}
                  </p>
                )}
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label
                  htmlFor="temperature"
                  className="block mb-2 text-sm font-medium text-gray-300"
                >
                  Temperature *
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  min="0"
                  max="2"
                  step="0.1"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
                    errors.temperature ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.temperature && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.temperature}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="topP"
                  className="block mb-2 text-sm font-medium text-gray-300"
                >
                  Top P *
                </label>
                <input
                  type="number"
                  id="topP"
                  name="topP"
                  value={formData.topP}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
                    errors.topP ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.topP && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.topP}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="maxTokens"
                  className="block mb-2 text-sm font-medium text-gray-300"
                >
                  Max Tokens *
                </label>
                <input
                  type="number"
                  id="maxTokens"
                  name="maxTokens"
                  value={formData.maxTokens}
                  onChange={handleInputChange}
                  min="1"
                  max="100000"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
                    errors.maxTokens ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.maxTokens && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.maxTokens}
                  </p>
                )}
              </div>
            </div>

            {/* Free Model Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={formData.isFree}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="isFree"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                This is a free model
              </label>
            </div>

            {/* System Prompt */}
            <div>
              <label
                htmlFor="systemPrompt"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                System Prompt *
              </label>
              <textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleInputChange}
                rows={8}
                placeholder="Enter the system prompt for this AI model..."
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 resize-vertical ${
                  errors.systemPrompt ? "border-red-500" : "border-gray-600"
                }`}
              />
              {errors.systemPrompt && (
                <p className="flex items-center gap-1 mt-1 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {errors.systemPrompt}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <Link
                to="/admin/config-ai"
                className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateConfigAI;
