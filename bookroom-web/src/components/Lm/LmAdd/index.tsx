
import AddPanel from '@/components/FormPanel/AddPanel';
import { addAILm } from '@/services/common/ai/lm';
import { message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface LmAddProps {
  platform: string;
  columns: any;
  refresh?: () => void;
  disabled?: boolean;
}

const LmAdd: React.FC<PropsWithChildren<LmAddProps>> = (props) => {
  const { platform, columns, refresh, disabled } = props;
  const [loading, setLoading] = useState<boolean>(false);
  /**
 * 添加模型
 * @param fields
 */
  const handleAdd = async (fields: any) => {
    setLoading(true);
    try {
      // 如果parameters是字符串
      if (fields?.parameters && typeof fields?.parameters === 'string') {
        fields.parameters = JSON.parse(fields.parameters);
      }
      // 添加模型
      await addAILm({
        platform
      }, {
        ...fields
      });
      message.success('添加成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AddPanel
      title={"添加模型"}
      columns={columns}
      onFinished={handleAdd}
      refresh={refresh}
      disabled={disabled || loading}
    />
  );
}
export default LmAdd;
