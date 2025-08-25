// src/components/CommentItem.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const CommentItem = ({ 
  comment, 
  userToken, 
  currentUserId,
  onCommentDeleted,
  onCommentUpdated
}) => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const isOwnComment = comment.user_id === currentUserId;
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleDelete = async () => {
    Alert.alert(
      "Excluir Comentário",
      "Tem certeza que deseja excluir este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await api.delete(`/comments/${comment.id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
              });
              
              if (onCommentDeleted) {
                onCommentDeleted(comment.id);
              }
            } catch (error) {
              console.error('Erro ao excluir comentário:', error);
              Alert.alert('Erro', 'Não foi possível excluir o comentário.');
            } finally {
              setIsDeleting(false);
            }
          } 
        }
      ]
    );
  };
  
  const handleUpdate = async () => {
    if (editedContent.trim() === '') {
      Alert.alert('Erro', 'O comentário não pode estar vazio.');
      return;
    }
    
    if (editedContent === comment.content) {
      setIsEditing(false);
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await api.put(`/comments/${comment.id}`, 
        { content: editedContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      if (onCommentUpdated) {
        onCommentUpdated({
          ...comment,
          content: editedContent
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o comentário.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => navigation.navigate('Profile', { userId: comment.user_id })}
        >
          <Image 
            source={
              comment.profile_picture_url 
                ? { uri: comment.profile_picture_url } 
                : require('../../assets/favicon.png')
            } 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.username}>{comment.username}</Text>
            <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
          </View>
        </TouchableOpacity>
        
        {isOwnComment && (
          <View style={styles.actions}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <Ionicons name="close-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#0066cc" />
                  ) : (
                    <Ionicons name="checkmark-outline" size={20} color="#0066cc" />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ff4d4d" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.commentBody}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            autoFocus
          />
        ) : (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
  },
  date: {
    fontSize: 11,
    color: '#888',
  },
  commentBody: {
    paddingLeft: 40, // Alinha com o nome de usuário
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
});

export default CommentItem;
