import { memo } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Slider,
  Button,
  Space,
  Row,
  Col,
} from "antd";

import type { SimulationConfig } from "../types/simulation";

const { Option } = Select;

interface SimulationControlPanelProps {
  visible?: boolean;
  initialConfig?: SimulationConfig;
  isRunning?: boolean;
  onConfigChange?: (config: SimulationConfig) => void;
  onStart?: () => void;
  onReset?: () => void;
}

const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  visible,
  initialConfig,
  isRunning,
  onConfigChange,
  onStart,
  onReset,
}) => {
  return (
    <Card
      title="模拟配置"
      size="small"
      style={{
        position: "absolute",
        top: 60,
        left: 15,
        width: 360,
        height: 400,
        padding: "12px 16px",
        display: visible ? "block" : "none",
      }}
    >
      <Form
        layout="vertical"
        initialValues={initialConfig}
        onValuesChange={(_, values) => onConfigChange?.({ ...values })}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="teamSize" label="每队玩家人数">
              <Select>
                <Option value="random">随机 (1-4人)</Option>
                <Option value={1}>1人</Option>
                <Option value={2}>2人</Option>
                <Option value={3}>3人</Option>
                <Option value={4}>4人</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="teamInterval" label="队伍间隔(秒)">
              <InputNumber
                min={10}
                max={600}
                step={10}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="timeMultiplier" label="时间倍数">
          <Slider
            min={1}
            max={120}
            step={1}
            marks={{
              1: "1x",
              30: "30x",
              60: "60x",
              90: "90x",
              120: "120x",
            }}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="playerSpeed" label="玩家行走速度(m/s)">
              <InputNumber
                min={0.1}
                max={2}
                step={0.1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="minAreaPerPlayer" label="最小人均面积(m²/人)">
              <InputNumber
                min={1}
                max={10}
                step={0.1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Space>
              <Button type="primary" disabled={isRunning} onClick={onStart}>
                开始模拟
              </Button>
              <Button onClick={onReset}>重置模拟</Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default memo(SimulationControlPanel);
