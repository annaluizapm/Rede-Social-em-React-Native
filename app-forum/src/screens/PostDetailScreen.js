import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  ActivityIndicator, Alert, Image, TouchableOpacity, FlatList,
  RefreshControl, SafeAreaView, StatusBar
} from 'react-native';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import CommentItem from '../components/CommentItem';
import CustomButton from '../components/CustomButton';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user, signOut } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initScreen = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      fetchPostAndComments();
    };
    
    initScreen();
  }, [postId]); // Adicionado postId como dependência para recarregar se o post mudar

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postResponse = await api.get(`/posts/${postId}`);
      setPost(postResponse.data);

      const commentsResponse = await api.get(`/comments/${postId}`);
      setComments(commentsResponse.data);

    } catch (error) {
      console.error('Erro ao buscar detalhes do post/comentários:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do post.');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) {
      Alert.alert('Erro', 'O comentário não pode ser vazio.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para comentar.');
        signOut();
        return;
      }

      const response = await api.post(
        `/comments/${postId}`,
        { content: newCommentContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      // Adicionar o novo comentário diretamente à lista
      if (response.data && response.data.comment) {
        setComments(prevComments => [response.data.comment, ...prevComments]);
        setNewCommentContent('');
      } else {
        // Se não retornar o comentário, recarrega tudo
        fetchPostAndComments();
        setNewCommentContent('');
      }

    } catch (error) {
      console.error('Erro ao criar comentário:', error.response?.data || error.message);
      Alert.alert('Erro ao Comentar', error.response?.data?.message || 'Ocorreu um erro ao adicionar o comentário.');
      if (error.response?.status === 401 || error.response?.status === 403) {
         signOut();
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleCommentDeleted = (commentId) => {
    // Atualiza a lista de comentários removendo o comentário excluído
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
    
    // Atualiza a contagem de comentários no post
    if (post) {
      setPost(prevPost => ({
        ...prevPost,
        comments_count: prevPost.comments_count > 0 ? prevPost.comments_count - 1 : 0
      }));
    }
  };
  
  const handleCommentUpdated = (updatedComment) => {
    // Atualiza a lista de comentários com o comentário editado
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post não encontrado.</Text>
      </View>
    );
  }

  const renderCommentItem = ({ item }) => (
    <CommentItem 
      comment={{
        ...item,
        profile_picture_url: item.profile_picture_url 
      }}
      userToken={userToken}
      currentUserId={user?.id}
      onCommentDeleted={handleCommentDeleted}
      onCommentUpdated={handleCommentUpdated}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Post</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchPostAndComments();
            }} 
          />
        }
      >
        {/* Detalhes do Post */}
        <View style={styles.postDetailCard}>
          <View style={styles.postHeader}>
            {post.profile_picture_url ? (
              <Image source={{ uri: post.profile_picture_url }} style={styles.profilePicture} />
            ) : (
              <Ionicons name="person-circle" size={40} color="#ccc" style={styles.profilePicturePlaceholder} />
            )}
            <Text style={styles.postUsername}>{post.username}</Text>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.image_url && (
            <Image 
              source={{ uri: post.image_url }} 
              style={styles.postImage}
              onError={(e) => {
                console.warn('Erro ao carregar imagem do post:', e.nativeEvent.error);
              }}
            />
          )}
          <View style={styles.postStatsContainer}>
            <Text style={styles.postStats}>{post.likes_count} Curtidas</Text>
            <Text style={styles.postStats}>{post.comments_count} Comentários</Text>
          </View>
        </View>

        {/* Seção de Comentários */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentários</Text>
          
          {/* Campo para Adicionar Comentário */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Adicione um comentário..."
              value={newCommentContent}
              onChangeText={setNewCommentContent}
              multiline
            />
            <CustomButton
              title={isSubmittingComment ? "Enviando..." : "Comentar"}
              onPress={handleCreateComment}
              disabled={isSubmittingComment}
              style={styles.commentButton}
            />
          </View>
          
          {/* Lista de Comentários */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCommentItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.noCommentsText}>
                Nenhum comentário ainda. Seja o primeiro!
              </Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 40, // Para iOS SafeArea
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollViewContent: {
    paddingBottom: 20, // Espaçamento inferior para a scrollview
  },
  postDetailCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicturePlaceholder: {
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: 'cover',
  },
  postStatsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    justifyContent: 'space-around',
  },
  postStats: {
    fontSize: 14,
    color: '#777',
  },
  commentsSection: {
    marginTop: 10,
    marginHorizontal: 15,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  addCommentContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  commentButton: {
    marginTop: 5,
  }
});

export default PostDetailScreen;