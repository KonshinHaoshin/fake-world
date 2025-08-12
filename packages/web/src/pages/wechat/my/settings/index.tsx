import BackFilledSVG from "@/assets/back-filled.svg?react";
import { canBeDetected } from "@/components/NodeDetected";
import useModeNavigate from "@/components/useModeNavigate";
import { MYSELF_ID } from "@/faker/wechat/user";
import { EMetaDataType } from "@/stateV2/detectedNode";
import { allProfilesAtom } from "@/stateV2/profile";
import { activeUserProfileAtom, setActiveUserId } from "@/stateV2/profile/activeUser";
// import { useTranslation } from "react-i18next"; // 暂时注释掉，因为还没有使用
import List from "@/wechatComponents/List";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, Modal, message } from "antd";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";

const Settings = () => {
	const navigate = useModeNavigate();
	// const { t } = useTranslation(); // 暂时注释掉，因为还没有使用
	const [allProfiles, setAllProfiles] = useAtom(allProfilesAtom);
	const myProfile = useAtomValue(activeUserProfileAtom);
	const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
	const [newUserData, setNewUserData] = useState({
		nickname: "",
		wechat: "",
		avatarInfo: "",
	});
	const [refreshKey, setRefreshKey] = useState(0);

	const otherUsers = allProfiles.filter((profile) => profile.id !== myProfile?.id);

	// 如果当前用户不存在，显示加载状态
	if (!myProfile) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	const handleSwitchUser = (userId: string) => {
		const targetProfile = allProfiles.find((profile) => profile.id === userId);
		if (targetProfile) {
			Modal.confirm({
				title: "确认切换用户",
				content: `确定要切换到用户 "${targetProfile.nickname}" 吗？`,
				onOk: () => {
					setActiveUserId(userId);
					// 触发重新渲染
					setRefreshKey((prev) => prev + 1);
					message.success(`已切换到用户: ${targetProfile.nickname}`);
				},
			});
		}
	};

	const handleAddUser = () => {
		if (!newUserData.nickname || !newUserData.wechat) {
			message.error("请填写完整信息");
			return;
		}

		const newUser = {
			id: `user_${Date.now()}`,
			nickname: newUserData.nickname,
			wechat: newUserData.wechat,
			avatarInfo: newUserData.avatarInfo || "https://via.placeholder.com/100x100?text=头像",
			momentsBackgroundLike: false,
			momentsPrivacy: "all" as const,
			privacy: "all" as const,
			thumbnailInfo: [],
			createdByFaker: false,
		};

		setAllProfiles((prev) => [...prev, newUser]);
		setIsAddUserModalVisible(false);
		setNewUserData({ nickname: "", wechat: "", avatarInfo: "" });
		message.success("用户添加成功");
	};

	const handleLogout = () => {
		Modal.confirm({
			title: "确认退出",
			content: "确定要退出当前用户吗？",
			onOk: () => {
				// 退出到默认用户
				setActiveUserId(MYSELF_ID);
				// 触发重新渲染
				setRefreshKey((prev) => prev + 1);
				message.success("已退出登录");
			},
		});
	};

	return (
		<>
			<canBeDetected.div
				key={refreshKey} // 添加key来触发重新渲染
				className="flex flex-1 flex-col"
				metaData={{
					treeItemDisplayName: "设置页面",
					type: EMetaDataType.MyProfile,
				}}
			>
				<div className="grid grid-cols-3 bg-[rgba(237,237,237,1)] px-4 py-2">
					<BackFilledSVG
						fill="black"
						className="h-5 w-5 cursor-pointer"
						onClick={() => navigate("/wechat/my")}
					/>
					<div className="flex items-center justify-center font-medium">设置</div>
					<div />
				</div>

				<div className="flex-1 bg-[rgba(237,237,237,1)]">
					<div className="bg-white p-4 mb-2">
						<div className="flex items-center space-x-3">
							<img
								src={myProfile?.avatarInfo || "https://via.placeholder.com/60x60?text=头像"}
								alt="头像"
								className="w-15 h-15 rounded-full"
							/>
							<div className="flex-1">
								<div className="font-medium text-lg">{myProfile?.nickname}</div>
								<div className="text-gray-500 text-sm">当前用户</div>
							</div>
							<Button icon={<LogoutOutlined />} onClick={handleLogout} type="text" danger>
								退出
							</Button>
						</div>
					</div>

					<List className="mb-2">
						<List.Item
							withJump
							icon={<UserOutlined className="text-blue-500" />}
							onClick={() => setIsAddUserModalVisible(true)}
						>
							添加新用户
						</List.Item>
					</List>

					{otherUsers.length > 0 && (
						<div className="bg-white mb-2">
							<div className="px-4 py-2 text-sm text-gray-500 border-b">其他用户</div>
							{otherUsers.map((user) => (
								<div
									key={user.id}
									className="flex items-center space-x-3 p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
									onClick={() => handleSwitchUser(user.id)}
								>
									<img
										src={user.avatarInfo || "https://via.placeholder.com/50x50?text=头像"}
										alt="头像"
										className="w-12 h-12 rounded-full"
									/>
									<div className="flex-1">
										<div className="font-medium">{user.nickname}</div>
										<div className="text-gray-500 text-sm">{user.wechat}</div>
									</div>
									<Button type="primary" size="small">
										切换
									</Button>
								</div>
							))}
						</div>
					)}

					<List className="mb-2">
						<List.Item withJump icon={<UserOutlined className="text-green-500" />}>
							账号与安全
						</List.Item>
						<List.Item withJump icon={<UserOutlined className="text-orange-500" />}>
							隐私
						</List.Item>
						<List.Item withJump icon={<UserOutlined className="text-purple-500" />}>
							通用
						</List.Item>
					</List>
				</div>
			</canBeDetected.div>

			<Modal
				title="添加新用户"
				open={isAddUserModalVisible}
				onOk={handleAddUser}
				onCancel={() => setIsAddUserModalVisible(false)}
				okText="添加"
				cancelText="取消"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">昵称</label>
						<Input
							placeholder="请输入昵称"
							value={newUserData.nickname}
							onChange={(e) => setNewUserData((prev) => ({ ...prev, nickname: e.target.value }))}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">微信号</label>
						<Input
							placeholder="请输入微信号"
							value={newUserData.wechat}
							onChange={(e) => setNewUserData((prev) => ({ ...prev, wechat: e.target.value }))}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">头像URL（可选）</label>
						<Input
							placeholder="请输入头像图片URL"
							value={newUserData.avatarInfo}
							onChange={(e) => setNewUserData((prev) => ({ ...prev, avatarInfo: e.target.value }))}
						/>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default Settings;
