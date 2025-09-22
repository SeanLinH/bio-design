import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Badge,
  ProgressBar,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import { useDebate } from '../context/DebateContext';
import ApiService from '../services/ApiService';

const { width, height } = Dimensions.get('window');

const DebateMonitorScreen = ({ navigation }) => {
  const { state, dispatch } = useDebate();
  const [isRunning, setIsRunning] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (state.session) {
      startDebateExecution();
    }
  }, [state.session]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollViewRef.current && state.session?.messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [state.session?.messages]);

  const startDebateExecution = async () => {
    if (!state.session) return;

    setIsRunning(true);
    dispatch({ type: 'UPDATE_SESSION_STATUS', payload: 'running' });

    try {
      // Get SSE stream with user_id
      const response = await ApiService.runSSE(
        state.session.question,
        state.session.user_id || 'user1'
      );

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              handleSSEMessage(data);
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }

      dispatch({ type: 'UPDATE_SESSION_STATUS', payload: 'completed' });
    } catch (error) {
      console.error('Error in debate execution:', error);
      addSystemMessage('執行過程中發生錯誤: ' + error.message);
      dispatch({ type: 'UPDATE_SESSION_STATUS', payload: 'error' });
      Alert.alert('錯誤', '執行過程中發生錯誤: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSSEMessage = (data) => {
    const { content, author, actions, timestamp, partial, id } = data;

    if (content && content.parts && content.parts[0]?.text) {
      const agentName = author || 'system';
      const messageContent = content.parts[0].text;

      // Create or update message
      const messageId = id || `${agentName}_${timestamp}`;
      const newMessage = {
        id: messageId,
        agent_name: agentName,
        content: messageContent,
        timestamp: new Date(timestamp * 1000).toLocaleTimeString(),
        type: determineMessageType(agentName),
        partial: partial || false,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });

      // Update agent status
      updateAgentStatus(agentName, partial ? 'running' : 'completed', messageContent);

      // Update progress
      updateProgress(agentName);
    }

    // Handle state changes
    if (actions?.stateDelta) {
      Object.keys(actions.stateDelta).forEach((key) => {
        if (key.endsWith('_output')) {
          const agentName = key.replace('_output', '');
          updateAgentStatus(agentName, 'completed', actions.stateDelta[key]);
        }
      });
    }
  };

  const determineMessageType = (agentName) => {
    if (agentName.includes('reporter')) return 'report';
    if (agentName.includes('convergencer')) return 'synthesis';
    if (agentName === 'system') return 'system';
    return 'analysis';
  };

  const updateAgentStatus = (agentName, status, output) => {
    const agentStatus = {
      name: agentName,
      status,
      output: output || undefined,
    };
    dispatch({ type: 'UPDATE_AGENT_STATUS', payload: agentStatus });
  };

  const updateProgress = (agentName) => {
    // Calculate progress based on agent execution order
    const agentOrder = ['unmet_need_source', 'debate_process', 'convergencer', 'reporter'];
    const currentIndex = agentOrder.findIndex((name) => agentName.includes(name));

    if (currentIndex >= 0) {
      const newProgress = ((currentIndex + 1) / agentOrder.length) * 100;
      dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
    }
  };

  const addSystemMessage = (content) => {
    const message = {
      id: `system_${Date.now()}`,
      agent_name: 'system',
      content,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      partial: false,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <ActivityIndicator size="small" color="#2196F3" />;
      case 'completed':
        return <Badge style={styles.completedBadge}>✓</Badge>;
      case 'error':
        return <Badge style={styles.errorBadge}>✗</Badge>;
      default:
        return <Badge style={styles.waitingBadge}>⏳</Badge>;
    }
  };

  const getMessageCardStyle = (type) => {
    switch (type) {
      case 'analysis':
        return [styles.messageCard, styles.analysisCard];
      case 'synthesis':
        return [styles.messageCard, styles.synthesisCard];
      case 'report':
        return [styles.messageCard, styles.reportCard];
      case 'system':
        return [styles.messageCard, styles.systemCard];
      default:
        return [styles.messageCard];
    }
  };

  const navigateToResults = () => {
    navigation.navigate('DebateResult');
  };

  if (!state.session) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noSessionText}>沒有找到辯論會話</Text>
            <Button mode="contained" onPress={() => navigation.goBack()}>
              返回配置
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>辯論進度</Text>
            {isRunning && <ActivityIndicator size="small" color="#2196F3" />}
          </View>
          <ProgressBar 
            progress={state.session.progress / 100} 
            color="#2196F3" 
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round(state.session.progress)}% 完成
          </Text>

          {state.session.status === 'completed' && (
            <Button
              mode="contained"
              onPress={navigateToResults}
              style={styles.viewResultsButton}
            >
              查看完整報告
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Question Display */}
      <Card style={styles.questionCard}>
        <Card.Content>
          <Text style={styles.questionTitle}>討論問題</Text>
          <Text style={styles.questionText}>{state.session.question}</Text>
        </Card.Content>
      </Card>

      {/* Agent Status Panel */}
      <Card style={styles.agentStatusCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Agent狀態</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.agentStatusContainer}>
              {state.session.agents_progress.map((agent, index) => (
                <View key={index} style={styles.agentStatusItem}>
                  <View style={styles.agentStatusHeader}>
                    {getStatusIcon(agent.status)}
                    <Text style={styles.agentName}>{agent.name}</Text>
                  </View>
                  <Chip mode="flat" style={styles.statusChip}>
                    {agent.status}
                  </Chip>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Messages Stream */}
      <Card style={styles.messagesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>實時辯論過程</Text>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={true}
          >
            {state.session.messages.length === 0 ? (
              <Text style={styles.noMessagesText}>
                {isRunning ? '等待Agent響應...' : '尚無消息'}
              </Text>
            ) : (
              state.session.messages.map((message) => (
                <Card key={message.id} style={getMessageCardStyle(message.type)}>
                  <Card.Content>
                    <View style={styles.messageHeader}>
                      <View style={styles.messageInfo}>
                        <Text style={styles.agentNameText}>{message.agent_name}</Text>
                        <Badge style={styles.typeBadge}>{message.type}</Badge>
                        {message.partial && (
                          <Badge style={styles.partialBadge}>輸入中...</Badge>
                        )}
                      </View>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                    <Text style={styles.messageContent}>{message.content}</Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  card: {
    marginBottom: 8,
  },
  progressCard: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  viewResultsButton: {
    marginTop: 8,
  },
  questionCard: {
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    color: '#666',
  },
  agentStatusCard: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  agentStatusContainer: {
    flexDirection: 'row',
  },
  agentStatusItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  agentStatusHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statusChip: {
    fontSize: 10,
  },
  messagesCard: {
    flex: 1,
  },
  messagesContainer: {
    maxHeight: height * 0.4,
  },
  noMessagesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  messageCard: {
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  analysisCard: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  synthesisCard: {
    borderLeftColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  reportCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  systemCard: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentNameText: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 14,
  },
  typeBadge: {
    marginRight: 8,
    fontSize: 10,
  },
  partialBadge: {
    backgroundColor: '#FF9800',
    fontSize: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  errorBadge: {
    backgroundColor: '#F44336',
  },
  waitingBadge: {
    backgroundColor: '#FF9800',
  },
  noSessionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});

export default DebateMonitorScreen;