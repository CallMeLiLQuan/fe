"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tabs, Descriptions, App } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { EditOutlined } from '@ant-design/icons';
import { getLandById } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import dynamic from 'next/dynamic';

const ViewOnlyMap = dynamic(() => import('@/component/map/ViewOnlyMap'), { ssr: false });

export default function LandDetail() {
  const router = useRouter();
  const params = useParams();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    const loadLand = async () => {
      try {
        const landId = Array.isArray(params?.id) ? params.id[0] : params?.id;
        
        if (!landId) {
          console.error('Land ID is undefined');
          message.error('ID khu đất không hợp lệ');
          setLoading(false);
          return;
        }

        const response = await getLandById(parseInt(landId));
        if (!response) {
          message.error('Không nhận được dữ liệu từ server');
          setLoading(false);
          return;
        }

        setLand(response);
      } catch (error) {
        console.error('Error loading land:', error);
        message.error('Không thể tải thông tin khu đất');
      } finally {
        setLoading(false);
      }
    };

    loadLand();
  }, [params?.id, message]);

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin cơ bản',
      children: (
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tên">{land?.name}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{land?.address}</Descriptions.Item>
            <Descriptions.Item label="Diện tích">{land?.area} ha</Descriptions.Item>
            <Descriptions.Item label="Giá trị">
              {land?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí">{land?.location}</Descriptions.Item>
            <Descriptions.Item label="Chủ sở hữu">{land?.owner?.name}</Descriptions.Item>
            <Descriptions.Item label="Vùng">{land?.region?.name}</Descriptions.Item>
            <Descriptions.Item label="Số khu vực">{land?.areaCount}</Descriptions.Item>
            {land?.planningMapUrl && (
              <Descriptions.Item label="Bản đồ quy hoạch">
                <a href={land.planningMapUrl} target="_blank" rel="noopener noreferrer">Xem bản đồ</a>
              </Descriptions.Item>
            )}
            {land?.googleMapUrl && (
              <Descriptions.Item label="Google Maps">
                <a href={land.googleMapUrl} target="_blank" rel="noopener noreferrer">Xem trên Google Maps</a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )
    },
    {
      key: 'map',
      label: 'Bản đồ',
      children: (
        <div className="h-[600px] mb-6">
          {land?.coordinate && (
            <ViewOnlyMap
              coordinates={land.coordinate}
            />
          )}
        </div>
      )
    }
  ];

  if (loading) return <div>Đang tải...</div>;
  if (!land) return <div>Không tìm thấy khu đất</div>;

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{land.name}</h1>
            <p className="text-gray-600">{land.address}</p>
          </div>
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={() => router.push(`/land/edit/${land.id}`)}
            >
              Chỉnh sửa
            </Button>
          </Space>
        </div>
      </Card>

      <Tabs defaultActiveKey="info" items={tabItems} />
    </div>
  );
}
