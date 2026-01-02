'use client';

import React, { useState } from 'react';
import { Court, useGetReviewsQuery, useAddReviewMutation } from '@/presentation/store/api/courtsApi';
import { useAppSelector } from '@/presentation/hooks/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faStar, faDirections, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from 'react-hot-toast';

interface CourtDetailsPanelProps {
    court: Court | null;
    onClose: () => void;
    onDirectionsRequest?: (pickLocation?: boolean) => void;
}

export const CourtDetailsPanel = ({ court, onClose, onDirectionsRequest }: CourtDetailsPanelProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: reviews, isLoading: isLoadingReviews } = useGetReviewsQuery(court?.id || '', {
        skip: !court
    });
    const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    if (!court) return null;

    const handleDirections = () => {
        if (onDirectionsRequest) {
            onDirectionsRequest();
        } else {
            // Fallback if no callback provided (though we will provide it)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`, '_blank');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addReview({
                court_id: court.id,
                user_id: user.id,
                rating,
                comment
            }).unwrap();

            toast.success('Đã gửi đánh giá!');
            setComment('');
            setRating(5);
        } catch (error) {
            toast.error('Lỗi khi gửi đánh giá');
        }
    };

    return (
        <div className="absolute top-4 right-4 w-96 bg-[#1a1a1a]/95 backdrop-blur-md border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] z-[2000] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-[#333] relative bg-[#252525]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="text-xl font-bold text-white pr-8">{court.name}</h2>
                <div className="flex items-start gap-2 mt-2 text-gray-400 text-sm">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 flex-shrink-0 text-tik-cyan" />
                    <span>{court.address || 'Chưa có địa chỉ'}</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    <Button
                        onClick={handleDirections}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                    >
                        <FontAwesomeIcon icon={faDirections} className="mr-2" />
                        Chỉ Đường (Vị Trí Của Tôi)
                    </Button>
                    <Button
                        onClick={() => onDirectionsRequest && onDirectionsRequest(true)}
                        className="w-full bg-[#333] hover:bg-[#444] text-gray-300 text-sm py-2 border border-white/10"
                    >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Chọn Điểm Xuất Phát
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Description */}
                {court.description && (
                    <div className="bg-[#252525] p-3 rounded-xl border border-[#333]">
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Thông tin</h3>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{court.description}</p>
                    </div>
                )}

                {/* Reviews */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                        Đánh giá & Bình luận
                        <span className="text-xs font-normal text-gray-500">{reviews?.length || 0} đánh giá</span>
                    </h3>

                    <div className="space-y-3 mb-6">
                        {isLoadingReviews ? (
                            <div className="text-center text-gray-500 text-sm py-4">Đang tải đánh giá...</div>
                        ) : reviews?.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-4 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
                        ) : (
                            reviews?.map((review) => (
                                <div key={review.id} className="bg-[#252525] p-3 rounded-xl border border-[#333]">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                {review.profiles?.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        {review.profiles?.display_name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-white">{review.profiles?.display_name || 'Ẩn danh'}</span>
                                        </div>
                                        <div className="flex text-yellow-500 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? '' : 'text-gray-600'} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-gray-400 mt-1 pl-8">{review.comment}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Review Form */}
                    {user ? (
                        <form onSubmit={handleSubmitReview} className="bg-[#252525] p-3 rounded-xl border border-[#333]">
                            <div className="flex gap-1 mb-3 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-lg transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500/50'}`}
                                    >
                                        <FontAwesomeIcon icon={faStar} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Viết đánh giá của bạn..."
                                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tik-cyan transition-colors"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    isLoading={isAddingReview}
                                    className="px-3 bg-tik-cyan text-black hover:bg-[#00d8d0]"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm text-blue-400">
                            Đăng nhập để viết đánh giá
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
