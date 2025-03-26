import { SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Flex,
  Select,
  Switch,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import SearchEngineSelect from '@/components/Search/SearchEngineSelect';
import AgentModelSelect from './AgentModelSelect/inex';
import AgentGraphSelect from './AgentGraphSelect/inex';

export interface ParametersType {
  isStream: boolean;
  searchEngine?: string;
  modelConfig?: object;
  graphConfig?: object;
}

export const defaultParameters: ParametersType = {
  isStream: true,
  searchEngine: undefined,
  modelConfig: undefined,
  graphConfig: undefined,
};

interface AgentParametersProps {
  data: any;
  parameters: any;
  changeParameters: (parameters: ParametersType) => void;
}

const AgentParameters: React.FC<AgentParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [searchEngine, setSearchEngine] = useState<string>();
  const [modelConfig, setModelConfig] = useState<object>();
  const [graphConfig, setGraphConfig] = useState<object>();
  const { data, parameters, changeParameters } = props;
  const { token } = useToken();

  useEffect(() => {
    if (parameters) {
      setIsStream(parameters?.isStream);
      setSearchEngine(parameters?.searchEngine);
      setModelConfig(parameters?.modeConfig);
      setGraphConfig(parameters?.graphConfig);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      isStream,
      searchEngine,
      modelConfig,
      graphConfig,
    };
    changeParameters(newParameters);
  };

  return (
    <>
      <Button
        type="primary"
        ghost
        icon={<SettingOutlined />}
        onClick={() => setDrawerVisible(true)}
      >
        参数设置
      </Button>
      <Drawer
        title="参数设置"
        placement="right"
        open={drawerVisible}
        onClose={() => {
          handleSave();
          setDrawerVisible(false);
        }}
      >
        <div className={styles.formPanel}>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel} >模型选择：</label>
            <AgentModelSelect
              className={styles.selectElement}
              values={modelConfig}
              onChange={(values: object) => setModelConfig(values)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel} >图谱选择：</label>
            <AgentGraphSelect
              className={styles.selectElement}
              values={graphConfig}
              onChange={(values: object) => setGraphConfig(values)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel} >搜索引擎：</label>
            <SearchEngineSelect
              value={searchEngine}
              onChange={(value: string) => setSearchEngine(value)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>流式输出：</label>
            <Switch
              value={isStream}
              onChange={(checked: boolean) => {
                if (checked) {
                  setIsStream(false);
                }
                setIsStream(checked);
              }}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>

        </div>
      </Drawer>
    </>
  );
};

export default AgentParameters;
