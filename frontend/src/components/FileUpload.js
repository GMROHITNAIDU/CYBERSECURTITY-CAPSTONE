import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const FileUpload = ({ 
  onUploadComplete, 
  maxFiles = 10, 
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = {},
  isPublic = false,
  description = '',
  tags = []
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon size={24} className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video size={24} className="text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music size={24} className="text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={24} className="text-orange-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!user) {
      toast.error('Please login to upload files');
      return;
    }

    if (acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    const newUploadProgress = {};

    try {
      const formData = new FormData();
      
      acceptedFiles.forEach((file, index) => {
        formData.append('files', file);
        newUploadProgress[file.name] = 0;
      });

      if (description) formData.append('description', description);
      if (tags.length > 0) formData.append('tags', tags.join(','));
      formData.append('is_public', isPublic);

      setUploadProgress(newUploadProgress);

      const response = await axios.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const updatedProgress = { ...newUploadProgress };
          acceptedFiles.forEach(file => {
            updatedProgress[file.name] = percentCompleted;
          });
          setUploadProgress(updatedProgress);
        }
      });

      setUploadedFiles(response.data.files);
      toast.success(`Successfully uploaded ${response.data.files.length} file(s)`);
      
      if (onUploadComplete) {
        onUploadComplete(response.data.files);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [user, maxFiles, isPublic, description, tags, onUploadComplete]);

  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== fileName));
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    multiple: maxFiles > 1,
    accept: acceptedFileTypes
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Max {maxFiles} files, {formatFileSize(maxFileSize)} per file
            </p>
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
            <AlertCircle size={16} />
            <span className="font-medium">Some files were rejected:</span>
          </div>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-300">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index} className="flex justify-between">
                <span>{file.name}</span>
                <span>{errors[0]?.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate flex-1 mr-2">{fileName}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Uploaded Files
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.mime_type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {file.original_filename}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <button
                    onClick={() => removeFile(file.filename)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;