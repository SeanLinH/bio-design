import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Chip,
  Modal,
  Portal,
  ActivityIndicator,
  Appbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useDebate } from '../context/DebateContext';
import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

const DebateSetupScreen = ({ navigation }) => {
  const { state, dispatch } = useDebate();
  const [question, setQuestion] = useState('');
  const [maxIterations, setMaxIterations] = useState(1);
  const [userId, setUserId] = useState('user1');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgentIndex, setEditingAgentIndex] = useState(-1);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [currentAgent, setCurrentAgent] = useState({
    id: null,
    name: '',
    instruction: '',
    description: '',
    temperature: 0.7,
    max_tokens: 131072,
    isExisting: false,
  });
  const [templateMenuVisible, setTemplateMenuVisible] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const [existingAgents, setExistingAgents] = useState([]);
  const [customAgents, setCustomAgents] = useState([]);

  // Use ApiService instance (imported as default export)
  const predefinedAgents = ApiService.getPredefinedAgents();
  const fixedConfig = ApiService.getFixedConfig();

  useEffect(() => {
    console.log('🚀 DebateSetupScreen mounted, loading agents...');
    loadExistingAgents();
  }, []);

  // Add debugging for state changes
  useEffect(() => {
    console.log('📊 existingAgents state changed:', existingAgents.length);
  }, [existingAgents]);

  useEffect(() => {
    console.log('📊 customAgents state changed:', customAgents.length);
  }, [customAgents]);

  const loadExistingAgents = async () => {
    console.log('🔍 loadExistingAgents started...');
    try {
      // Get the 5 core expert agents
      console.log('📞 Calling getCoreExpertAgents...');
      const coreExperts = await ApiService.getCoreExpertAgents();
      console.log('✅ getCoreExpertAgents returned:', coreExperts.length, 'experts');
      console.log('📋 Core experts:', coreExperts.map(a => a.name));
      console.log('📋 Core experts IDs:', coreExperts.map(a => a.id));

      // Force state update with explicit check
      console.log('🔄 Setting existingAgents state...');
      setExistingAgents(coreExperts);
      console.log('✅ State update called');
      
      // Also load any custom agents that were created
      const allAgents = await ApiService.getAgents();
      const coreExpertNames = [
        'supply_chain',  // Use actual name from backend
        'materials_manager',
        'logistics_expert',
        'risk_management',
        'regulatory_authority'
      ];
      
      const customAgentsList = allAgents.filter(agent =>
        !coreExpertNames.includes(agent.name)
      );
      console.log('🔄 Setting customAgents state...');
      setCustomAgents(customAgentsList);
      console.log('📊 Final state - existing:', coreExperts.length, 'custom:', customAgentsList.length);
      console.log('📊 Custom agents:', customAgentsList.map(a => `${a.name}(${a.id})`));
      
    } catch (error) {
      console.error('❌ Error loading existing agents:', error);
      Alert.alert('錯誤', '無法載入現有Agent: ' + error.message);
    }
  };

  const openAgentModal = (template = null, agentData = null, isExisting = false) => {
    if (template) {
      // Using a template - generate unique name with timestamp
      const uniqueName = `${template.name}_${Date.now()}`;
      setCurrentAgent({
        id: null,
        name: uniqueName,
        instruction: template.instruction,
        description: template.description,
        temperature: 0.7,
        max_tokens: 131072,
        isExisting: false,
      });
      setEditingAgentId(null);
    } else if (agentData) {
      // Editing existing agent
      setCurrentAgent({
        id: agentData.id,
        name: agentData.name,
        instruction: agentData.instruction || '',
        description: agentData.description || '',
        temperature: agentData.temperature || 0.7,
        max_tokens: agentData.max_tokens || 131072,
        isExisting: isExisting,
      });
      setEditingAgentId(agentData.id);
    } else {
      // Creating new custom agent
      setCurrentAgent({
        id: null,
        name: '',
        instruction: '',
        description: '',
        temperature: 0.7,
        max_tokens: 131072,
        isExisting: false,
      });
      setEditingAgentId(null);
    }
    setShowAgentModal(true);
  };

  const saveAgent = async () => {
    if (!currentAgent.name.trim()) {
      Alert.alert('錯誤', '請輸入Agent名稱');
      return;
    }

    if (!currentAgent.instruction.trim()) {
      Alert.alert('錯誤', '請輸入Agent指令');
      return;
    }

    setSetupInProgress(true);

    try {
      if (currentAgent.isExisting && editingAgentId) {
        // Update existing agent
        await ApiService.updateAgent(editingAgentId, {
          name: currentAgent.name,
          instruction: currentAgent.instruction,
          description: currentAgent.description,
          temperature: currentAgent.temperature || 0.7,
          max_tokens: currentAgent.max_tokens || 131072,
        });
        
        // Reload existing agents
        await loadExistingAgents();
        Alert.alert('成功', 'Agent已更新');
      } else {
        // Create new custom agent
        const response = await ApiService.createAgent({
          name: currentAgent.name,
          instruction: currentAgent.instruction,
          description: currentAgent.description,
          temperature: currentAgent.temperature,
          max_tokens: currentAgent.max_tokens,
        });

        // Add to custom agents list
        const newAgent = response.agents;
        setCustomAgents(prev => [...prev, newAgent]);

        // Update debate process to include the new agent (according to CLAUDE.md)
        try {
          const coreExpertIds = existingAgents.map(agent => agent.id);
          const allCustomAgentIds = [...customAgents.map(agent => agent.id), newAgent.id];
          const allAgentIds = [...coreExpertIds, ...allCustomAgentIds];

          await ApiService.updateDebateProcess(allAgentIds);
          console.log('✅ Debate process updated with new agent:', newAgent.id);
        } catch (error) {
          console.error('⚠️ Warning: Could not update debate process:', error);
          // Don't fail the agent creation if debate process update fails
        }

        Alert.alert('成功', 'Agent已創建並添加到辯論流程');
      }

      setShowAgentModal(false);
      setEditingAgentId(null);
    } catch (error) {
      console.error('Error saving agent:', error);
      let errorMessage = '保存Agent時發生錯誤: ' + error.message;

      // Handle specific error cases
      if (error.message.includes('409') || error.message.includes('already exists')) {
        errorMessage = '此Agent名稱已存在，請使用不同的名稱或編輯現有的Agent。';
      } else if (error.message.includes('400')) {
        errorMessage = '請檢查Agent配置是否正確，確保所有必填欄位都已填寫。';
      }

      Alert.alert('錯誤', errorMessage);
    } finally {
      setSetupInProgress(false);
    }
  };

  const removeCustomAgent = async (agentId) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除這個自定義Agent嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteAgent(agentId);
              const updatedCustomAgents = customAgents.filter(agent => agent.id !== agentId);
              setCustomAgents(updatedCustomAgents);

              // Update debate process to remove the deleted agent (according to CLAUDE.md)
              try {
                const coreExpertIds = existingAgents.map(agent => agent.id);
                const remainingCustomAgentIds = updatedCustomAgents.map(agent => agent.id);
                const allAgentIds = [...coreExpertIds, ...remainingCustomAgentIds];

                await ApiService.updateDebateProcess(allAgentIds);
                console.log('✅ Debate process updated after agent deletion:', agentId);
              } catch (error) {
                console.error('⚠️ Warning: Could not update debate process after deletion:', error);
                // Don't fail the agent deletion if debate process update fails
              }

              Alert.alert('成功', 'Agent已刪除並從辯論流程中移除');
            } catch (error) {
              console.error('Error deleting agent:', error);
              Alert.alert('錯誤', '刪除Agent時發生錯誤: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const startDebate = async () => {
    if (!question.trim()) {
      Alert.alert('錯誤', '請輸入辯論問題');
      return;
    }

    if (!userId.trim()) {
      Alert.alert('錯誤', '請輸入用戶ID');
      return;
    }

    // Check if we have the 5 core experts loaded
    if (existingAgents.length === 0) {
      Alert.alert('錯誤', '尚未載入專家Agents，請稍後再試');
      return;
    }

    setSetupInProgress(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Use the loaded core expert agents (5 experts)
      const coreExpertIds = existingAgents.map(agent => agent.id);
      
      // Add custom agents to the debate process
      const customAgentIds = customAgents.map(agent => agent.id);
      const allAgentIds = [...coreExpertIds, ...customAgentIds];

      // For now, we'll proceed with the run_sse directly
      // since the debate process should already be configured with the 5 experts
      
      // Create session
      const sessionResponse = await ApiService.createSession(userId);
      const sessionId = `session_${Date.now()}`;

      // Create debate session
      const debateSession = {
        session_id: sessionId,
        space_id: fixedConfig.spaceId,
        app_id: fixedConfig.appId,
        question,
        max_iterations: maxIterations,
        user_id: userId,
        status: 'preparing',
        current_iteration: 0,
        current_agent: '',
        agents_progress: [],
        messages: [],
        progress: 0,
        participating_agents: [...existingAgents, ...customAgents],
      };

      dispatch({ type: 'CREATE_SESSION', payload: debateSession });

      // Navigate to monitor screen
      navigation.navigate('DebateMonitor');
    } catch (error) {
      console.error('Error setting up debate:', error);
      Alert.alert('錯誤', '設置辯論時發生錯誤: ' + error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setSetupInProgress(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User ID Input */}
        <Card style={styles.card}>
          <Card.Title title="用戶設置" />
          <Card.Content>
            <TextInput
              label="用戶ID"
              value={userId}
              onChangeText={setUserId}
              mode="outlined"
              placeholder="輸入您的用戶ID"
            />
          </Card.Content>
        </Card>

        {/* Question Input */}
        <Card style={styles.card}>
          <Card.Title title="辯論問題" />
          <Card.Content>
            <TextInput
              label="請輸入要討論的問題"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={3}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Iterations Setting */}
        <Card style={styles.card}>
          <Card.Title title="最大迭代次數" />
          <Card.Content>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={maxIterations}
                onValueChange={setMaxIterations}
                style={styles.picker}
              >
                <Picker.Item label="1次" value={1} />
                <Picker.Item label="2次" value={2} />
                <Picker.Item label="3次" value={3} />
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {/* Existing Agents Management */}
        <Card style={styles.card}>
          <Card.Title title="預設專家Agent (可編輯)" />
          <Card.Content>
            <Text style={styles.sectionDescription}>
              這些是系統預設的專業領域Agent。只有核心專家Agent (ID: 84-88) 可以編輯，其他Agent顯示🔒圖標且不可編輯。
            </Text>
            <View style={styles.agentsContainer}>
              {existingAgents.map((agent, index) => {
                // According to CLAUDE.md, only agents 84,85,86,87,88 can be edited
                const allowedEditableIds = [84, 85, 86, 87, 88];
                const isEditable = allowedEditableIds.includes(agent.id);

                return (
                  <Chip
                    key={agent.id}
                    mode="flat"
                    onPress={() => {
                      if (isEditable) {
                        openAgentModal(null, agent, true);
                      } else {
                        Alert.alert('提示', `Agent ${agent.name} (ID: ${agent.id}) 不允許編輯`);
                      }
                    }}
                    style={[
                      styles.agentChip,
                      styles.existingAgentChip,
                      !isEditable && styles.nonEditableAgentChip
                    ]}
                    textStyle={[
                      styles.existingAgentText,
                      !isEditable && styles.nonEditableAgentText
                    ]}
                  >
                    {agent.name} {!isEditable && '🔒'}
                  </Chip>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* Custom Agents Management */}
        <Card style={styles.card}>
          <Card.Title
            title="自定義Expert Agent"
            right={(props) => (
              <View style={styles.headerButtons}>
                <Menu
                  visible={templateMenuVisible}
                  onDismiss={() => setTemplateMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setTemplateMenuVisible(true)}
                      style={styles.templateButton}
                    >
                      使用模板
                    </Button>
                  }
                >
                  {ApiService.getDefaultAgentTemplates().map((template, index) => (
                    <Menu.Item
                      key={index}
                      onPress={() => {
                        openAgentModal(template);
                        setTemplateMenuVisible(false);
                      }}
                      title={template.name}
                    />
                  ))}
                </Menu>
                <Button
                  mode="contained"
                  onPress={() => openAgentModal()}
                  style={styles.addButton}
                >
                  新增Agent
                </Button>
              </View>
            )}
          />
          <Card.Content>
            <Text style={styles.sectionDescription}>
              您可以創建自己的專業領域Agent參與辯論
            </Text>
            {customAgents.length === 0 ? (
              <Text style={styles.noAgentsText}>尚未添加任何自定義Agent</Text>
            ) : (
              <View style={styles.agentsContainer}>
                {customAgents.map((agent, index) => (
                  <Chip
                    key={agent.id}
                    mode="flat"
                    onPress={() => openAgentModal(null, agent, false)}
                    onClose={() => removeCustomAgent(agent.id)}
                    style={[styles.agentChip, styles.customAgentChip]}
                    textStyle={styles.customAgentText}
                  >
                    {agent.name}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Debug Controls (only show in development) */}
        {__DEV__ && (
          <Card style={styles.card}>
            <Card.Title title="Debug Controls" />
            <Card.Content>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadExistingAgents();
                }}
                style={{ marginBottom: 8 }}
              >
                Refresh Agents (Debug)
              </Button>
              <Text style={{ fontSize: 12, color: 'gray' }}>
                Current state: existing={existingAgents.length}, custom={customAgents.length}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Card.Title title="辯論摘要" />
          <Card.Content>
            <Text style={styles.summaryText}>
              • 預設專家: {existingAgents.length} 個
            </Text>
            {/* Debug info */}
            {__DEV__ && (
              <Text style={[styles.summaryText, { fontSize: 10, color: 'gray' }]}>
                Debug: existing={existingAgents.length}, custom={customAgents.length}
              </Text>
            )}
            {existingAgents.length > 0 && (
              <View style={styles.agentList}>
                {existingAgents.map((agent, index) => (
                  <Chip key={agent.id} style={styles.agentChip} compact>
                    {agent.name}
                  </Chip>
                ))}
              </View>
            )}
            <Text style={styles.summaryText}>
              • 自定義專家: {customAgents.length} 個
            </Text>
            <Text style={styles.summaryText}>
              • 總參與Agent: {existingAgents.length + customAgents.length} 個
            </Text>
            <Text style={styles.summaryText}>
              • 最大迭代次數: {maxIterations} 次
            </Text>
            {existingAgents.length >= 5 && (
              <Text style={[styles.summaryText, { color: 'green', fontWeight: 'bold' }]}>
                ✅ 5個核心專家已就緒，可以開始辯論！
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Start Button */}
        <Button
          mode="contained"
          onPress={startDebate}
          disabled={setupInProgress || !question.trim() || !userId.trim()}
          loading={setupInProgress}
          style={styles.startButton}
        >
          {setupInProgress ? '準備中...' : '開始辯論'}
        </Button>
      </ScrollView>

      {/* Agent Configuration Modal */}
      <Portal>
        <Modal
          visible={showAgentModal}
          onDismiss={() => setShowAgentModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>
              {currentAgent.isExisting 
                ? `編輯預設Agent: ${currentAgent.name}` 
                : editingAgentId 
                  ? '編輯自定義Agent' 
                  : '新增自定義Agent'
              }
            </Text>

            <TextInput
              label="Agent名稱"
              value={currentAgent.name}
              onChangeText={(text) => setCurrentAgent({ ...currentAgent, name: text })}
              mode="outlined"
              style={styles.modalInput}
              disabled={currentAgent.isExisting} // Don't allow editing name of existing agents
            />

            <TextInput
              label="描述"
              value={currentAgent.description}
              onChangeText={(text) => setCurrentAgent({ ...currentAgent, description: text })}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label="指令"
              value={currentAgent.instruction}
              onChangeText={(text) => setCurrentAgent({ ...currentAgent, instruction: text })}
              multiline
              numberOfLines={8}
              mode="outlined"
              style={styles.modalInput}
            />

            {!currentAgent.isExisting && (
              <View style={styles.parameterContainer}>
                <TextInput
                  label="Temperature"
                  value={currentAgent.temperature.toString()}
                  onChangeText={(text) =>
                    setCurrentAgent({ ...currentAgent, temperature: parseFloat(text) || 0.7 })
                  }
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.parameterInput}
                />

                <TextInput
                  label="Max Tokens"
                  value={currentAgent.max_tokens.toString()}
                  onChangeText={(text) =>
                    setCurrentAgent({ ...currentAgent, max_tokens: parseInt(text) || 131072 })
                  }
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.parameterInput}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowAgentModal(false)}
                style={styles.modalButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={saveAgent} 
                style={styles.modalButton}
                loading={setupInProgress}
                disabled={setupInProgress}
              >
                {setupInProgress ? '保存中...' : '保存'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateButton: {
    marginRight: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  noAgentsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  agentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agentChip: {
    margin: 4,
  },
  existingAgentChip: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  existingAgentText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  customAgentChip: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
    borderWidth: 1,
  },
  customAgentText: {
    color: '#7B1FA2',
    fontWeight: '500',
  },
  nonEditableAgentChip: {
    backgroundColor: '#F5F5F5',
    borderColor: '#BDBDBD',
    borderWidth: 1,
    opacity: 0.7,
  },
  nonEditableAgentText: {
    color: '#757575',
    fontWeight: '400',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  summaryCard: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#E8F5E8',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#2E7D32',
  },
  agentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  agentChip: {
    margin: 2,
    backgroundColor: '#C8E6C9',
  },
  startButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 12,
  },
  parameterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parameterInput: {
    flex: 0.48,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalButton: {
    flex: 0.4,
  },
});

export default DebateSetupScreen;