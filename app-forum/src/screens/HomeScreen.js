// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert,
  FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image,
  Dimensions, RefreshControl, SafeAreaView, StatusBar
} from 'react-native';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Componentes personalizados
import PostCard from '../components/PostCard';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';
import theme from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const { signOut, userToken, userData } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newPostImageUri, setNewPostImageUri] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  const { width } = Dimensions.get('window');
  const isTabletOrDesktop = width >= theme.breakpoints.tablet;

  useEffect(() => {
    // Usar os dados do usuário do contexto
    if (userData) {
      setCurrentUserId(userData.id);
    }
    
    // Resetar página quando o termo de pesquisa muda
    if (searchTerm) {
      setPage(1);
      setHasMorePosts(true);
    }
    
    fetchPosts(1, true);

    // Pedir permissão para acessar a galeria de imagens
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
      }
    })();
  }, [searchTerm]);

  const fetchPosts = async (pageToLoad = page, resetList = false) => {
    if (resetList) {
      setLoadingPosts(true);
    }
    
    try {
      const response = await api.get(`/posts?q=${searchTerm}&page=${pageToLoad}&limit=10`);
      
      // Se não houver mais posts, definir hasMorePosts como false
      if (response.data.length === 0) {
        setHasMorePosts(false);
        return;
      }
      
      // Atualizar estado dos likes e favoritos do usuário
      if (userData?.id) {
        try {
          // Buscar likes do usuário
          const likesResponse = await api.get(`/users/${userData.id}/likes`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          
          const newUserLikes = {};
          if (likesResponse.data && Array.isArray(likesResponse.data)) {
            likesResponse.data.forEach(like => {
              newUserLikes[like.post_id] = true;
            });
          }
          setUserLikes(newUserLikes);
          
          // Buscar favoritos do usuário
          const favoritesResponse = await api.get(`/users/${userData.id}/favorites`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          
          const newUserFavorites = {};
          if (favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
            favoritesResponse.data.forEach(favorite => {
              newUserFavorites[favorite.post_id] = true;
            });
          }
          setUserFavorites(newUserFavorites);
          
        } catch (error) {
          console.log('Aviso: Erro ao buscar likes ou favoritos:', error.message);
          // Não mostrar erro para o usuário, apenas definir valores padrão
          setUserLikes({});
          setUserFavorites({});
        }
      }
      
      // Atualizar a lista de posts (anexar ou substituir)
      if (response.data && Array.isArray(response.data)) {
        setPosts(prevPosts => resetList ? response.data : [...prevPosts, ...response.data]);
      }
      
      // Atualizar a página atual
      setPage(pageToLoad);
      
    } catch (error) {
      console.log('Erro ao buscar posts:', error.message);
      
      // Não mostrar alertas para erros de rede comuns
      if (!error.response) {
        console.log('Erro de conexão - modo offline');
      } else {
        console.log('Erro do servidor:', error.response.status);
      }
      
      // Em caso de erro, garantir que não quebre a UI
      if (resetList) {
        setPosts([]);
      }
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMorePosts(true);
    fetchPosts(1, true);
  }, [searchTerm]);
  
  const loadMorePosts = () => {
    if (!loadingPosts && hasMorePosts) {
      fetchPosts(page + 1);
    }
  };
  
  const pickPostImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPostImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo do post não podem ser vazios.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você precisa estar logado para criar um post.');
        signOut();
        return;
      }

      console.log('API URL:', api.defaults.baseURL);
      console.log('Enviando novo post:', { title: newPostTitle, content: newPostContent });
      console.log('Token de autenticação presente:', !!userToken);

      let imageUrlToSave = null;
      if (newPostImageUri) {
        // Fazer upload da imagem do post primeiro
        const formData = new FormData();
        formData.append('postImage', {
          uri: newPostImageUri,
          name: `post_${userData.id}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });

        try {
          console.log('Fazendo upload da imagem...');
          const uploadResponse = await api.post('/upload/post-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
          });
          imageUrlToSave = uploadResponse.data.imageUrl;
          console.log('Upload bem-sucedido:', imageUrlToSave);
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem do post:', uploadError);
          console.error('Detalhes do erro de upload:', uploadError.response?.data || uploadError.message);
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da imagem do post.');
          setIsSubmitting(false);
          return;
        }
      }

      // Criando o post
      console.log('Enviando requisição para criar post...');
      const response = await api.post(
        '/posts',
        { title: newPostTitle, content: newPostContent, image_url: imageUrlToSave },
        { 
          headers: { 
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Post criado com sucesso:', response.data);

      // Limpar formulário e recarregar posts
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUri(null);
      setShowNewPostForm(false);
      
      // Recarregar a primeira página dos posts
      fetchPosts(1, true);
      
      Alert.alert('Sucesso', 'Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      
      if (error.response) {
        // O servidor respondeu com um código de status fora do intervalo 2xx
        console.error('Detalhes da resposta:', error.response.data);
        console.error('Status:', error.response.status);
        Alert.alert('Erro ao Criar Post', error.response.data.message || 'Erro no servidor');
        
        if (error.response.status === 401 || error.response.status === 403) {
          Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
          signOut();
        }
      } else if (error.request) {
        // A requisição foi feita mas não recebeu resposta
        console.error('Sem resposta do servidor:', error.request);
        Alert.alert('Erro de Conexão', 
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e se o servidor está rodando.');
      } else {
        // Algo aconteceu na configuração da requisição que causou o erro
        console.error('Erro na requisição:', error.message);
        Alert.alert('Erro na Requisição', error.message || 'Ocorreu um erro inesperado');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador para curtir/descurtir um post
  const handleToggleLike = async (postId, isLiked) => {
    setUserLikes(prevLikes => ({
      ...prevLikes,
      [postId]: isLiked,
    }));

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              likes_count: isLiked 
                ? (post.likes_count || 0) + 1 
                : Math.max(0, (post.likes_count || 0) - 1) 
            }
          : post
      )
    );
  };

  // Manipulador para favoritar/desfavoritar um post
  const handleToggleFavorite = async (postId, isFavorited) => {
    setUserFavorites(prevFavorites => ({
      ...prevFavorites,
      [postId]: isFavorited,
    }));
  };
  
  // Manipulador para excluir um post
  const handleDeletePost = async (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: async () => {
        await signOut();
      }}
    ]);
  };

  const renderPostItem = ({ item }) => (
    <PostCard
      post={{
        ...item,
        liked: userLikes[item.id],
        favorited: userFavorites[item.id]
      }}
      onLike={handleToggleLike}
      onFavorite={handleToggleFavorite}
      refreshPosts={() => handleDeletePost(item.id)}
      userToken={userToken}
      userId={userData?.id}
    />
  );

  const renderFooter = () => {
    if (!hasMorePosts) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingMoreText}>Carregando mais posts...</Text>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={70} color={theme.colors.gray400} />
      <Text style={styles.emptyTitle}>Nenhum post encontrado</Text>
      <Text style={styles.emptySubtitle}>
        {searchTerm 
          ? "Tente ajustar sua pesquisa ou criar um novo post." 
          : "Seja o primeiro a criar um post!"}
      </Text>
      <CustomButton 
        title="Criar Novo Post" 
        icon="add-circle-outline" 
        onPress={() => setShowNewPostForm(true)}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header com nome do usuário logado */}
      <Header 
        title="DevSocial"
        showLogout={true}
        user={userData}
        rightComponent={
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => setShowNewPostForm(!showNewPostForm)}
          >
            <Ionicons 
              name={showNewPostForm ? "close-circle-outline" : "add-circle-outline"} 
              size={28} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        }
      />

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar posts..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={() => fetchPosts(1, true)}
        />
        {searchTerm ? (
          <TouchableOpacity 
            onPress={() => {
              setSearchTerm('');
              fetchPosts(1, true);
            }} 
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.gray500} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Formulário de novo post (visível quando showNewPostForm=true) */}
      {showNewPostForm && (
        <View style={styles.createPostContainer}>
          <Text style={styles.formTitle}>Criar nova publicação</Text>
          <TextInput
            style={styles.input}
            placeholder="Título da publicação"
            value={newPostTitle}
            onChangeText={setNewPostTitle}
          />
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="O que você está pensando?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            textAlignVertical="top"
          />
          
          <View style={styles.imagePickerRow}>
            <CustomButton
              title="Adicionar Imagem"
              icon="image-outline"
              type="outline"
              onPress={pickPostImage}
              style={styles.imagePickerButton}
            />
            {newPostImageUri && (
              <TouchableOpacity 
                onPress={() => setNewPostImageUri(null)}
                style={styles.removeImageButton}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              </TouchableOpacity>
            )}
          </View>
          
          {newPostImageUri && (
            <Image source={{ uri: newPostImageUri }} style={styles.previewImage} />
          )}
          
          <View style={styles.formActions}>
            <CustomButton
              title="Cancelar"
              type="secondary"
              onPress={() => {
                setShowNewPostForm(false);
                setNewPostTitle('');
                setNewPostContent('');
                setNewPostImageUri(null);
              }}
              style={styles.cancelButton}
            />
            <CustomButton
              title={isSubmitting ? "Publicando..." : "Publicar"}
              loading={isSubmitting}
              disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
              onPress={handleCreatePost}
              style={styles.publishButton}
            />
          </View>
        </View>
      )}

      {/* Lista de Posts */}
      {loadingPosts && page === 1 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.mainLoader} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={[
            styles.postList,
            posts.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={loadingPosts && page > 1 ? renderFooter : null}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    // SafeAreaView já cuida do espaçamento do status bar
  },
  mainLoader: {
    marginTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  createPostContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentInput: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  imagePickerButton: {
    flex: 1,
  },
  removeImageButton: {
    marginLeft: 12,
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  publishButton: {
    flex: 1,
    marginLeft: 8,
  },
  postList: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 200,
    borderRadius: 25,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  newPostButton: {
    padding: 8,
  },
});

export default HomeScreen;