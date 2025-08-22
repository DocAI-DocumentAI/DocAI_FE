import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DocumentAIAnalyzeConfig, CreateDocumentAIAnalyzeConfigRequest } from '../../services/documentAIAnalyzeService';

const schema = z.object({
  modelName: z.string().min(1, 'Model Name is required'),
  modelId: z.string().min(1, 'Model ID is required'),
  maxToken: z.number().int().positive('Max Tokens must be a positive number').max(32000, 'Max Tokens cannot exceed 32,000'),
  systemPrompt: z.string().min(1, 'System Prompt is required'),
  isDefault: z.boolean(),
});

interface DocumentAIAnalyzeFormProps {
  onSubmit: (data: CreateDocumentAIAnalyzeConfigRequest) => void;
  initialData?: DocumentAIAnalyzeConfig;
  isSubmitting: boolean;
}

const DocumentAIAnalyzeForm: React.FC<DocumentAIAnalyzeFormProps> = ({ 
  onSubmit, 
  initialData, 
  isSubmitting 
}) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<CreateDocumentAIAnalyzeConfigRequest>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      modelName: '',
      modelId: '',
      maxToken: 3500,
      systemPrompt: 'Phân tích tài liệu và trả về một đối tượng JSON duy nhất với các khóa sau:\n\n- "title": string — tiêu đề của tài liệu (required).\n\n- "versionName": string — mã số/số hiệu tài liệu (bao gồm loại văn bản + mã/ký hiệu) (required).\n\n- "description": string — Tạo mô tả rõ ràng, ngắn gọn (2-3 câu) giải thích tài liệu này về gì, mục đích chính và đối tượng ảnh hưởng. Tập trung vào mục tiêu và phạm vi của tài liệu.\n\n- "signedBy": string — người ký văn bản ở phần CUỐI tài liệu (khối chữ ký). Bao gồm tên và (nếu có) chức danh.\n\nQuy tắc trích xuất:\n* Nếu chỉ có chức danh mà không rõ tên, trả về chính chức danh.',
      isDefault: false,
    },
  });

  const systemPromptValue = watch('systemPrompt');

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-300 mb-2">
              Model Name *
            </label>
            <Controller
              name="modelName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="modelName"
                  placeholder="e.g., openai/gpt-oss-120b"
                  className="block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            />
            {errors.modelName && (
              <p className="mt-2 text-sm text-red-500">{errors.modelName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-gray-300 mb-2">
              Model ID *
            </label>
            <Controller
              name="modelId"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="modelId"
                  placeholder="e.g., openai/gpt-oss-120b"
                  className="block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            />
            {errors.modelId && (
              <p className="mt-2 text-sm text-red-500">{errors.modelId.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="maxToken" className="block text-sm font-medium text-gray-300 mb-2">
            Max Tokens *
          </label>
          <Controller
            name="maxToken"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                id="maxToken"
                min="1"
                max="32000"
                placeholder="3500"
                onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                className="block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            )}
          />
          {errors.maxToken && (
            <p className="mt-2 text-sm text-red-500">{errors.maxToken.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">Maximum number of tokens the model can generate (1-32,000)</p>
        </div>

        <div>
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt *
          </label>
          <Controller
            name="systemPrompt"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="systemPrompt"
                rows={12}
                placeholder="Enter the system prompt for document analysis..."
                className="block w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              />
            )}
          />
          {errors.systemPrompt && (
            <p className="mt-2 text-sm text-red-500">{errors.systemPrompt.message}</p>
          )}
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Define how the AI should analyze and extract information from documents</span>
            <span>{systemPromptValue?.length || 0} characters</span>
          </div>
        </div>

        <div className="flex items-center">
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="isDefault"
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                checked={field.value}
                onChange={field.onChange}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-300">
            Set as default configuration
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-500 rounded-md shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentAIAnalyzeForm;
