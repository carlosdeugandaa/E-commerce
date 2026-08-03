import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Delete,
  Flag,
  Person,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { markReviewHelpful, deleteReview } from '../../firebase/config';

function ReviewCard({ review, productId, currentUser, isAdmin, onReviewDeleted }) {
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [isHelpful, setIsHelpful] = useState(
    review.helpfulUsers?.includes(currentUser?.uid) || false
  );

  const handleHelpful = async () => {
    if (!currentUser) {
      toast.info('Please login to mark reviews as helpful');
      return;
    }
    if (isHelpful) return;

    setHelpfulLoading(true);
    try {
      const result = await markReviewHelpful(review.id, currentUser.uid);
      if (result.success) {
        setHelpfulCount(result.helpful);
        setIsHelpful(true);
        toast.success('Review marked as helpful!');
      } else {
        toast.error(result.error || 'Failed to mark as helpful');
      }
    } catch (error) {
      toast.error('Failed to mark as helpful');
    } finally {
      setHelpfulLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteReview(
        review.id, 
        currentUser?.uid, 
        isAdmin
      );
      if (result.success) {
        toast.success('Review deleted successfully!');
        setDeleteDialogOpen(false);
        if (onReviewDeleted) onReviewDeleted();
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canDelete = currentUser && (
    currentUser.uid === review.userId || isAdmin
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Get color for avatar based on user ID
  const getAvatarColor = (id) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
    const index = (id?.length || 0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
        {/* Review Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: getAvatarColor(review.userId),
                width: 36, 
                height: 36,
                fontSize: '0.9rem',
              }}
            >
              {getInitials(review.userName)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {review.userName || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {review.date || 'Recently'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={review.rating} readOnly size="small" precision={0.5} />
            {canDelete && (
              <IconButton
                size="small"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ color: 'error.main' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Review Content */}
        <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>
          {review.comment}
        </Typography>

        {/* Review Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Button
            size="small"
            startIcon={isHelpful ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleHelpful}
            disabled={helpfulLoading || isHelpful}
            sx={{ color: isHelpful ? 'primary.main' : 'text.secondary' }}
          >
            {helpfulLoading ? (
              <CircularProgress size={16} />
            ) : (
              `Helpful (${helpfulCount})`
            )}
          </Button>
          {review.userId === currentUser?.uid && (
            <Chip 
              label="Your review" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReviewCard;
