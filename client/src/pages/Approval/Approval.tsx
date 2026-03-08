import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Approval.scss";
import {
  listUnapprovedUsers,
  approveUser,
  rejectUser,
} from "helpers/api/approval";

type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

const Approval = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUnapprovedUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load unapproved users", error);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: number) => {
    try {
      await approveUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="approval-container">
      <h1 className="approval-title">{t("Pending User Approvals")}</h1>
      {loading ? (
        <p className="approval-loading">{t("Loading...")}</p>
      ) : users.length === 0 ? (
        <p className="approval-empty">{t("No users waiting for approval.")}</p>
      ) : (
        <div className="approval-list">
          {users.map((user) => (
            <div className="approval-card" key={user.email}>
              <div className="approval-info">
                <p className="approval-name">{user.name}</p>
                <p className="approval-email">{user.email}</p>
                <p className="approval-role">{t("Roles:")} {user.roles?.join(", ") || t("None")}</p>
              </div>
              <div className="approval-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(user.id)}
                >
                  {t("Approve")}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(user.id)}
                >
                  {t("Reject")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approval;
