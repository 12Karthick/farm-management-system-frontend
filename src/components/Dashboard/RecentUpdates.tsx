import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './RecentUpdates.css';

interface Update {
  id: string;
  title: string;
  by: string;
  time: string;
  dotColor: string;
}

const updates: Update[] = [
  { id: '1', title: 'Added new Farm Worker', by: 'by John Doe', time: '2h ago', dotColor: '#06b6d4' },
  { id: '2', title: 'Updated Area Configuration', by: 'by Jane Smith', time: '5h ago', dotColor: '#33597f' },
  { id: '3', title: 'Modified Function Group', by: 'by Mike Johnson', time: '1d ago', dotColor: '#ec4899' },
];

export default function RecentUpdates() {
  return (
    <div className="recent-updates" id="recent-updates-section">
      <div className="recent-updates__header">
        <div className="recent-updates__title-row">
          <CalendarOutlined className="recent-updates__header-icon" />
          <h3 className="recent-updates__title">Recent Updates</h3>
        </div>
        <Button
          type="link"
          id="btn-view-all-updates"
          className="recent-updates__view-all"
        >
          View All <ArrowRightOutlined />
        </Button>
      </div>

      <div className="recent-updates__list">
        {updates.map((update) => (
          <div key={update.id} className="update-item">
            <span className="update-item__dot" style={{ background: update.dotColor }} />
            <div className="update-item__body">
              <p className="update-item__title">{update.title}</p>
              <p className="update-item__by">{update.by}</p>
            </div>
            <div className="update-item__right">
              <span className="update-item__time">{update.time}</span>
              <ArrowRightOutlined className="update-item__arrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
