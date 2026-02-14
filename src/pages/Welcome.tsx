import { PageContainer } from '@ant-design/pro-components';
import { useModel, useRequest } from '@umijs/max';
import { Card, theme } from 'antd';
import React, { useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { getVisitStats } from '@/services/blog';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');

  // 获取访问统计数据
  const { data: response, loading } = useRequest(getVisitStats, {
    manual: false,
  });

  useEffect(() => {
    console.log('API Response:', response);
  }, [response])

  // 转换数据：API 已经返回按天聚合的数据
  const chartData = React.useMemo(() => {
    const rawData = response || [];
    console.log('Raw data from API:', rawData);

    // 转换为图表数据格式
    const data = rawData.map((item: any) => {
      // 提取日期部分 (YYYY-MM-DD)
      const date = item.date?.split(' ')[0] || item.date;
      return {
        date,
        visits: item.totalVisits || 0,
      };
    });

    console.log('Chart data:', data);
    return data;
  }, [response]);

  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'visits',
    smooth: true,
    point: {
      size: 10,
      shape: 'circle',
    },
    interaction: {
      tooltip: {
        render: (_event: any, { title, items }: any) => {
          return `<div style="padding: 8px;">
            <div>${title}</div>
            <div>访问次数: ${items[0]?.value}</div>
          </div>`;
        },
      },
    },
    xAxis: {
      title: {
        text: '日期',
      },
    },
    yAxis: {
      title: {
        text: '访问次数',
      },
    },
  };

  console.log('Chart data:', chartData);
  console.log('Chart data length:', chartData.length);

  return (
    <PageContainer>
      {/* 访问统计图表 */}
      <Card
        style={{
          borderRadius: 8,
          marginTop: 16,
        }}
        title="文章访问统计"
        loading={loading}
      >
        <Line {...chartConfig} height={300} />
      </Card>
    </PageContainer>
  );
};

export default Welcome;
