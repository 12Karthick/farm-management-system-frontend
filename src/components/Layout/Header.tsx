import { UserOutlined } from '@ant-design/icons';
import './Header.css';

interface HeaderProps {
    organizationName?: string;
    farmName?: string;
}

export default function Header({
    organizationName = 'AgriTech Solutions',
    farmName = 'Green Valley Farm',
}: HeaderProps) {
    return (
        <header className="header">
            {/* Left: Org + Farm name */}
            <div className="header__identity">
                <h1 className="header__org">{organizationName}</h1>
                <p className="header__farm">{farmName}</p>
            </div>

            {/* Right: Actions */}
            <div className="header__actions">
                {/* Notification */}
                {/* <Badge dot offset={[-2, 2]}>
          <button className="header__icon-btn" id="btn-notifications" aria-label="Notifications">
            <BellOutlined />
          </button>
        </Badge> */}

                {/* User avatar */}
                <button className="header__avatar-btn" id="btn-user-profile" aria-label="User profile">
                    <UserOutlined />
                </button>
            </div>
        </header>
    );
}
