import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  FAB,
  Modal,
  Portal,
} from 'react-native-paper';
import { useDebate } from '../context/DebateContext';

const { width, height } = Dimensions.get('window');

const DebateResultScreen = ({ navigation }) => {
  const { state } = useDebate();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '分析', value: 'analysis' },
    { label: '綜合', value: 'synthesis' },
    { label: '報告', value: 'report' },
    { label: '系統', value: 'system' },
  ];

  const getFilteredMessages = () => {
    if (!state.session?.messages) return [];
    
    if (filterType === 'all') {
      return state.session.messages;
    }
    
    return state.session.messages.filter(message => message.type === filterType);
  };

  const getFinalReport = () => {
    if (!state.session?.messages) return null;
    
    // Find the last report message
    const reportMessages = state.session.messages.filter(
      message => message.type === 'report' || message.agent_name === 'reporter'
    );
    
    return reportMessages.length > 0 ? reportMessages[reportMessages.length - 1] : null;
  };

  const getDiscussionSummary = () => {
    if (!state.session?.messages) return [];
    
    // Group messages by agent
    const agentMessages = {};
    
    state.session.messages.forEach(message => {
      if (message.type !== 'system') {
        if (!agentMessages[message.agent_name]) {
          agentMessages[message.agent_name] = [];
        }
        agentMessages[message.agent_name].push(message);
      }
    });
    
    return Object.entries(agentMessages).map(([agentName, messages]) => ({
      agentName,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1],
    }));
  };

  const shareReport = async () => {
    const finalReport = getFinalReport();
    
    if (!finalReport) {
      Alert.alert('錯誤', '沒有找到最終報告');
      return;
    }
    
    try {
      const result = await Share.share({
        message: `辯論報告\n\n問題: ${state.session.question}\n\n${finalReport.content}`,
        title: '辯論結果報告',
      });
    } catch (error) {
      Alert.alert('錯誤', '分享失敗: ' + error.message);
    }
  };

  const exportDiscussion = async () => {
    if (!state.session?.messages) {
      Alert.alert('錯誤', '沒有討論記錄');
      return;
    }
    
    let exportText = `辯論討論記錄\n\n`;
    exportText += `問題: ${state.session.question}\n`;
    exportText += `最大迭代次數: ${state.session.max_iterations}\n`;
    exportText += `執行時間: ${new Date().toLocaleString()}\n\n`;
    
    state.session.messages.forEach(message => {
      exportText += `[${message.timestamp}] ${message.agent_name} (${message.type})\n`;
      exportText += `${message.content}\n\n`;
    });
    
    try {
      const result = await Share.share({
        message: exportText,
        title: '辯論討論記錄',
      });
    } catch (error) {
      Alert.alert('錯誤', '導出失敗: ' + error.message);
    }
  };

  const showMessageDetail = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
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

  const startNewDebate = () => {
    navigation.navigate('DebateSetup');
  };

  if (!state.session) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noSessionText}>沒有找到辯論結果</Text>
            <Button mode="contained" onPress={startNewDebate}>
              開始新辯論
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const finalReport = getFinalReport();
  const discussionSummary = getDiscussionSummary();
  const filteredMessages = getFilteredMessages();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Session Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>辯論摘要</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>問題:</Text>
              <Text style={styles.summaryValue}>{state.session.question}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>狀態:</Text>
              <Chip mode="flat" style={styles.statusChip}>
                {state.session.status}
              </Chip>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>迭代次數:</Text>
              <Text style={styles.summaryValue}>{state.session.max_iterations}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>參與Agent數:</Text>
              <Text style={styles.summaryValue}>{discussionSummary.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>總消息數:</Text>
              <Text style={styles.summaryValue}>{state.session.messages.length}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Final Report */}
        {finalReport && (
          <Card style={styles.reportCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>最終報告</Text>
              <Text style={styles.reportContent}>
                {finalReport.content.length > 500 
                  ? finalReport.content.substring(0, 500) + '...' 
                  : finalReport.content}
              </Text>
              {finalReport.content.length > 500 && (
                <Button 
                  mode="outlined" 
                  onPress={() => showMessageDetail(finalReport)}
                  style={styles.readMoreButton}
                >
                  閱讀完整報告
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Agent Participation Summary */}
        <Card style={styles.participationCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Agent參與摘要</Text>
            {discussionSummary.map((summary, index) => (
              <View key={index} style={styles.participationItem}>
                <View style={styles.participationHeader}>
                  <Text style={styles.agentName}>{summary.agentName}</Text>
                  <Chip mode="flat" style={styles.messageCountChip}>
                    {summary.messageCount} 條消息
                  </Chip>
                </View>
                <Text style={styles.lastMessageTime}>
                  最後活動: {summary.lastMessage.timestamp}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Discussion Timeline */}
        <Card style={styles.timelineCard}>
          <Card.Content>
            <View style={styles.timelineHeader}>
              <Text style={styles.sectionTitle}>討論時間軸</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContainer}>
                  {filterOptions.map((option) => (
                    <Chip
                      key={option.value}
                      mode={filterType === option.value ? 'flat' : 'outlined'}
                      onPress={() => setFilterType(option.value)}
                      style={styles.filterChip}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            <ScrollView style={styles.timelineContainer}>
              {filteredMessages.length === 0 ? (
                <Text style={styles.noMessagesText}>沒有符合條件的消息</Text>
              ) : (
                filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    style={getMessageCardStyle(message.type)}
                    onPress={() => showMessageDetail(message)}
                  >
                    <Card.Content>
                      <View style={styles.messageHeader}>
                        <View style={styles.messageInfo}>
                          <Text style={styles.agentNameText}>{message.agent_name}</Text>
                          <Chip mode="flat" style={styles.typeBadge}>
                            {message.type}
                          </Chip>
                        </View>
                        <Text style={styles.timestamp}>{message.timestamp}</Text>
                      </View>
                      <Text style={styles.messagePreview}>
                        {message.content.length > 150 
                          ? message.content.substring(0, 150) + '...'
                          : message.content}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              )}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>操作</Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={shareReport}
                style={styles.actionButton}
                disabled={!finalReport}
              >
                分享報告
              </Button>
              <Button
                mode="outlined"
                onPress={exportDiscussion}
                style={styles.actionButton}
              >
                導出討論
              </Button>
              <Button
                mode="contained"
                onPress={startNewDebate}
                style={styles.actionButton}
              >
                新辯論
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Message Detail Modal */}
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedMessage && (
            <ScrollView>
              <Text style={styles.modalTitle}>
                {selectedMessage.agent_name} - {selectedMessage.type}
              </Text>
              <Text style={styles.modalTimestamp}>
                {selectedMessage.timestamp}
              </Text>
              <Divider style={styles.modalDivider} />
              <Text style={styles.modalContent}>
                {selectedMessage.content}
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowDetailModal(false)}
                style={styles.modalCloseButton}
              >
                關閉
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button for Quick Actions */}
      <FAB
        icon="share"
        style={styles.fab}
        onPress={shareReport}
        disabled={!finalReport}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 80,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    flex: 1,
  },
  statusChip: {
    fontSize: 12,
  },
  reportCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reportContent: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  readMoreButton: {
    marginTop: 12,
  },
  participationCard: {
    marginBottom: 16,
  },
  participationItem: {
    marginBottom: 12,
  },
  participationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageCountChip: {
    fontSize: 12,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineCard: {
    marginBottom: 16,
  },
  timelineHeader: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  timelineContainer: {
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
    fontSize: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsCard: {
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 100,
    margin: 4,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  modalDivider: {
    marginBottom: 16,
  },
  modalContent: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 20,
  },
  modalCloseButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  noSessionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});

export default DebateResultScreen;