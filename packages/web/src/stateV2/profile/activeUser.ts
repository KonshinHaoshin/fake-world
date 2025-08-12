import { MYSELF_ID } from "@/faker/wechat/user";
import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import atomWithStorage from "../atomWithStorage";
import { mainStore } from "../store";
import { allProfilesAtom } from "./core";

/**
 * 当前活跃用户ID
 */
export const activeUserIdAtom = atomWithStorage<string>("activeUserId", MYSELF_ID);

/**
 * 当前活跃用户的个人信息
 */
export const activeUserProfileAtom = atom((get) => {
	const activeUserId = get(activeUserIdAtom);
	const allProfiles = get(allProfilesAtom);
	return allProfiles.find((profile) => profile.id === activeUserId);
});

/**
 * 用于编辑当前活跃用户资料的atom
 */
export const editableActiveUserProfileAtom = focusAtom(allProfilesAtom, (optic) =>
	optic.find((v) => v.id === mainStore.get(activeUserIdAtom)),
);

/**
 * 设置活跃用户
 */
export const setActiveUserId = (userId: string) => {
	// 更新活跃用户ID
	mainStore.set(activeUserIdAtom, userId);
};
