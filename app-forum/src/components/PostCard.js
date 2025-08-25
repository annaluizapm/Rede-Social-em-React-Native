// src/components/PostCard.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

// Função para validar se a URL é válida
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  // Verificar se é uma URL válida
  try {
    const parsedUrl = new URL(url);
    // Verificar se o protocolo é http ou https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    // Verificar se há pelo menos um domínio válido
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      return false;
    }
    return true;
  } catch {
    // Se não é uma URL válida, verificar se é um caminho relativo válido
    return url.startsWith('/uploads') && url.length > 8;
  }
};

const PostCard = ({ 
  post, 
  onLike, 
  onFavorite, 
  showActions = true, 
  refreshPosts,
  userToken,
  userId
}) => {
  const navigation = useNavigation();
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Estado local para atualização imediata da UI
  const [postData, setPostData] = useState(post);
  
  // Verificar se o post pertence ao usuário logado
  const isOwnPost = postData.user_id === userId;

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const response = await api.post(`/posts/${postData.id}/like`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      // Atualizando o estado local do post
      setPostData({
        ...postData,
        liked: !postData.liked,
        likes_count: postData.liked 
          ? (postData.likes_count - 1) 
          : (postData.likes_count + 1)
      });
      
      // Notificando o componente pai
      if (onLike) onLike(postData.id, !postData.liked);
      
    } catch (error) {
      // console.error('Erro ao curtir post:', error);
      Alert.alert('Erro', 'Não foi possível curtir este post.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    try {
      setIsFavoriting(true);
      const response = await api.post(`/posts/${postData.id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      // Atualizando o estado local do post
      setPostData({
        ...postData,
        favorited: !postData.favorited
      });
      
      // Notificando o componente pai
      if (onFavorite) onFavorite(postData.id, !postData.favorited);
      
    } catch (error) {
      // console.error('Erro ao favoritar post:', error);
      Alert.alert('Erro', 'Não foi possível favoritar este post.');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDeletePost = async () => {
    Alert.alert(
      "Excluir Post",
      "Tem certeza que deseja excluir este post?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await api.delete(`/posts/${postData.id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
              });
              
              Alert.alert("Sucesso", "Post excluído com sucesso!");
              
              // Atualizar lista de posts no componente pai
              if (refreshPosts) refreshPosts();
              
            } catch (error) {
              // console.error('Erro ao excluir post:', error);
              Alert.alert('Erro', 'Não foi possível excluir este post.');
            } finally {
              setIsDeleting(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Cabeçalho do Card - Autor e Data */}
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.author}
          onPress={() => navigation.navigate('Profile', { userId: postData.user_id })}
        >
          <Image 
            source={
              postData.profile_picture_url 
                ? { uri: postData.profile_picture_url } 
                : require('../../assets/favicon.png')
            } 
            style={styles.authorAvatar} 
          />
          <Text style={styles.authorName}>{postData.username || 'Usuário'}</Text>
        </TouchableOpacity>
        <Text style={styles.date}>{formatDate(postData.created_at)}</Text>
      </View>
      
      {/* Corpo do Card - Título, Conteúdo e Imagem */}
      <TouchableOpacity 
        style={styles.cardBody}
        onPress={() => {
          try {
            navigation.navigate('PostDetail', { postId: postData.id });
          } catch (error) {
            console.error('Erro ao navegar para PostDetail:', error);
            Alert.alert('Erro', 'Não foi possível abrir os detalhes do post.');
          }
        }}
      >
        <Text style={styles.postTitle}>{postData.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {postData.content}
        </Text>
      </TouchableOpacity>
      
      {/* Imagem separada do clique principal */}
      {postData.image_url && isValidImageUrl(postData.image_url) && (
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Carregando imagem...</Text>
            </View>
          )}
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <Ionicons name="image-outline" size={50} color="#999" />
              <Text style={styles.errorText}>Erro ao carregar imagem</Text>
              <Text style={styles.urlText} numberOfLines={1}>{postData.image_url}</Text>
            </View>
          )}
          {!imageError && (
            <TouchableOpacity
              onPress={() => {
                try {
                  navigation.navigate('PostDetail', { postId: postData.id });
                } catch (error) {
                  console.error('Erro ao navegar via imagem:', error);
                  Alert.alert('Erro', 'Não foi possível abrir os detalhes do post.');
                }
              }}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: postData.image_url }} 
                style={[styles.postImage, imageLoading && styles.hiddenImage]}
                resizeMode="cover"
                onLoad={() => {
                  // console.log('✅ Imagem carregada:', postData.image_url);
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.warn('❌ Erro ao carregar imagem:', e.nativeEvent.error, postData.image_url);
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Rodapé do Card - Ações (curtir, comentar, favoritar) */}
      {showActions && (
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.action}
            onPress={handleLike}
            disabled={isLiking}
          >
            {isLiking ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <Ionicons 
                name={postData.liked ? "heart" : "heart-outline"} 
                size={20} 
                color={postData.liked ? "#e91e63" : "#666"} 
              />
            )}
            <Text style={styles.actionText}>
              {postData.likes_count || 0} {postData.likes_count === 1 ? 'Curtida' : 'Curtidas'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.action}
            onPress={() => navigation.navigate('PostDetail', { postId: postData.id })}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#666" />
            <Text style={styles.actionText}>
              {postData.comments_count || 0} {postData.comments_count === 1 ? 'Comentário' : 'Comentários'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.action}
            onPress={handleFavorite}
            disabled={isFavoriting}
          >
            {isFavoriting ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <Ionicons 
                name={postData.favorited ? "bookmark" : "bookmark-outline"} 
                size={18} 
                color={postData.favorited ? "#ffc107" : "#666"} 
              />
            )}
          </TouchableOpacity>
          
          {isOwnPost && (
            <TouchableOpacity 
              style={styles.action}
              onPress={handleDeletePost}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ff0000" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#ff0000" />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    width: screenWidth - 16,
    alignSelf: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  authorName: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: 16,
    flex: 1,
  },
  date: {
    color: '#666',
    fontSize: 13,
    fontWeight: '400',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    lineHeight: 26,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  hiddenImage: {
    position: 'absolute',
    opacity: 0,
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  imageErrorContainer: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  urlText: {
    marginTop: 4,
    color: '#ccc',
    fontSize: 10,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});

export default PostCard;
