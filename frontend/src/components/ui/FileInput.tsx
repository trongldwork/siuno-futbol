import { InputHTMLAttributes, forwardRef, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Upload, X } from 'lucide-react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  onFileChange?: (file: File | null) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, helperText, className, onFileChange, ...props }, externalRef) => {
    const [fileName, setFileName] = useState<string>('');
    const internalRef = useRef<HTMLInputElement | null>(null);
    
    // Use external ref if provided, otherwise use internal ref
    const inputRef = (externalRef as React.MutableRefObject<HTMLInputElement | null>) || internalRef;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFileName(file?.name || '');
      onFileChange?.(file);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setFileName('');
      onFileChange?.(null);
      if (inputRef && 'current' in inputRef && inputRef.current) {
        inputRef.current.value = '';
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={(el) => {
              // Set internal ref
              if (internalRef && 'current' in internalRef) {
                internalRef.current = el;
              }
              // Also set external ref if provided
              if (typeof externalRef === 'function') {
                externalRef(el);
              } else if (externalRef && 'current' in externalRef) {
                externalRef.current = el;
              }
            }}
            type="file"
            className="hidden"
            onChange={handleChange}
            {...props}
          />
          <div
            className={clsx(
              'flex items-center justify-between w-full px-3 py-2 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors',
              error
                ? 'border-red-300'
                : 'border-gray-300',
              className
            )}
            onClick={() => {
              if (inputRef && 'current' in inputRef && inputRef.current) {
                inputRef.current.click();
              }
            }}
          >
            <div className="flex items-center flex-1 min-w-0">
              <Upload className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <span className={clsx(
                'text-sm truncate',
                fileName ? 'text-gray-900' : 'text-gray-500'
              )}>
                {fileName || 'Choose file...'}
              </span>
            </div>
            {fileName && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Clear file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
