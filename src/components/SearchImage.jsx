import React, { useState, useRef } from 'react';

const SearchImage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchLimit, setSearchLimit] = useState(5);
    const fileInputRef = useRef(null);

    const API_BASE_URL = 'http://localhost:5000';

    // Handle file selection
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setError(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Search by file upload
    const searchByUpload = async () => {
        if (!selectedImage) {
            setError('Vui lòng chọn hình ảnh để tìm kiếm');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('limit', searchLimit);

        try {
            const response = await fetch(`${API_BASE_URL}/search/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setSearchResults(data.results);
            } else {
                setError(data.error || 'Có lỗi xảy ra khi tìm kiếm');
            }
        } catch (err) {
            setError(`Lỗi kết nối: ${err.message}`);
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Search by base64 (alternative method)
    const searchByBase64 = async () => {
        if (!selectedImage) {
            setError('Vui lòng chọn hình ảnh để tìm kiếm');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64String = e.target.result.split(',')[1]; // Remove data:image/jpeg;base64,

                const response = await fetch(`${API_BASE_URL}/search/base64`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: base64String,
                        limit: searchLimit
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    setSearchResults(data.results);
                } else {
                    setError(data.error || 'Có lỗi xảy ra khi tìm kiếm');
                }
                setIsLoading(false);
            };

            reader.onerror = () => {
                setError('Lỗi đọc file hình ảnh');
                setIsLoading(false);
            };

            reader.readAsDataURL(selectedImage);
        } catch (err) {
            setError(`Lỗi kết nối: ${err.message}`);
            console.error('Search error:', err);
            setIsLoading(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setSearchResults([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Test API health
    const testConnection = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            alert(`API Status: ${data.status} - ${data.message}`);
        } catch (err) {
            alert(`Không thể kết nối với API: ${err.message}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Tìm Kiếm Hình Ảnh Tương Tự</h2>
                <button
                    onClick={testConnection}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition-colors duration-300 text-sm font-medium"
                >
                    Test API Connection
                </button>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
                <div
                    className="border-4 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 bg-gray-50 hover:bg-blue-50 min-h-80 flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full max-h-96 rounded-lg shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                <p className="text-white font-medium">Kéo thả hoặc click để thay đổi hình ảnh</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-6xl text-gray-400">📷</div>
                            <p className="text-xl font-medium text-gray-600">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                            <p className="text-sm text-gray-500">Hỗ trợ: JPG, PNG, GIF</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />
            </div>

            {/* Search Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gray-50 rounded-lg gap-6">
                <div className="flex items-center gap-3">
                    <label className="font-medium text-gray-700">Số kết quả:</label>
                    <select
                        value={searchLimit}
                        onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={searchByUpload}
                        disabled={!selectedImage || isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors duration-300 min-w-40"
                    >
                        {isLoading ? 'Đang tìm kiếm...' : 'Tìm Kiếm (Upload)'}
                    </button>

                    <button
                        onClick={searchByBase64}
                        disabled={!selectedImage || isLoading}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors duration-300 min-w-40"
                    >
                        {isLoading ? 'Đang tìm kiếm...' : 'Tìm Kiếm (Base64)'}
                    </button>

                    <button
                        onClick={clearSearch}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-300"
                    >
                        Xóa
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
                    <p className="font-medium">❌ {error}</p>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex flex-col items-center gap-6 p-10 bg-blue-50 rounded-lg mb-8">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-blue-700 font-medium">Đang phân tích hình ảnh và tìm kiếm...</p>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                        Kết Quả Tìm Kiếm ({searchResults.length} hình ảnh tương tự)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.map((result, index) => (
                            <div key={result.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <img
                                        src={`./ml/dataset/clothes/Clothes_Dataset/Polo/${result.filename}`}
                                        alt={result.filename}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.png';
                                        }}
                                    />
                                </div>
                                <div className="p-4 bg-white">
                                    <p className="font-semibold text-gray-800 text-sm mb-2 break-all">{result.filename}</p>
                                    <p className="text-green-600 font-medium mb-1 text-base">
                                        Độ tương tự: {(result.score * 100).toFixed(2)}%
                                    </p>
                                    <p className="text-gray-500 text-sm">Thứ hạng: #{index + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchImage;
