import React, { useState } from "react";
import { Button, Switch, Space, Tooltip, Card } from "antd";
import {
  SoundOutlined,
  SoundFilled,
  BellOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

interface NotificationControlsProps {
  onTestNotification?: () => void;
}

export const NotificationControls: React.FC<NotificationControlsProps> = ({
  onTestNotification,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("notificationSoundEnabled") !== "false"
  );

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("notificationSoundEnabled", enabled.toString());
    toast.success(
      enabled ? "Notification sound enabled" : "Notification sound disabled",
      { icon: enabled ? "🔊" : "🔇" }
    );
  };

  const handleTestNotification = () => {
    // Create a test notification
    toast.success(
      <div>
        <div className="font-semibold">Test Notification</div>
        <div className="text-sm text-gray-600">
          This is a test notification to check your settings
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Test Department • {new Date().toLocaleTimeString()}
        </div>
      </div>,
      {
        duration: 6000,
        icon: "🔔",
        style: {
          maxWidth: "400px",
        },
      }
    );

    // Play sound if enabled
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          600,
          audioContext.currentTime + 0.1
        );

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log("Could not play test sound:", error);
      }
    }

    if (onTestNotification) {
      onTestNotification();
    }
  };

  const handleRefreshNotifications = async () => {
    try {
      await refreshNotifications();
      await refreshUnreadCount();
      toast.success("Notifications refreshed", {
        icon: "🔄",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to refresh notifications", {
        icon: "❌",
      });
    }
  };

  return (
    <Card
      size="small"
      title="Notification Settings"
      style={{ marginBottom: 24 }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            {soundEnabled ? <SoundFilled /> : <SoundOutlined />}
            <span>Notification Sound</span>
          </Space>
          <Switch
            checked={soundEnabled}
            onChange={handleSoundToggle}
            size="small"
          />
        </div>

        <Space wrap style={{ width: "100%", justifyContent: "center" }}>
          <Tooltip title="Send a test notification to check your settings">
            <Button
              type="default"
              icon={<BellOutlined />}
              onClick={handleTestNotification}
              size="small"
            >
              Test Notification
            </Button>
          </Tooltip>

          <Tooltip title="Refresh notifications from server">
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={handleRefreshNotifications}
              size="small"
            >
              Refresh Notifications
            </Button>
          </Tooltip>
        </Space>
      </Space>
    </Card>
  );
};

export default NotificationControls;
