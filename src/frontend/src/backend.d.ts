import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Playlist {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    chapterId: bigint;
}
export interface Chapter {
    id: bigint;
    name: string;
    description: string;
    subjectId: bigint;
    number: bigint;
}
export interface PlaylistItem {
    id: bigint;
    title: string;
    isCompleted: boolean;
    order: bigint;
    description: string;
    playlistId: bigint;
    notes: string;
    resourceUrl: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface backendInterface {
    analyzeAndOrganizeTelegram(telegramUrl: string, geminiApiKey: string): Promise<string>;
    createChapter(_id: bigint, subjectId: bigint, name: string, number: bigint, desc: string): Promise<void>;
    createPlaylist(_id: bigint, chapterId: bigint, name: string, desc: string): Promise<void>;
    createPlaylistItem(_id: bigint, playlistId: bigint, title: string, desc: string, resourceUrl: string, notes: string, order: bigint): Promise<void>;
    createSubject(_id: bigint, name: string, desc: string, color: string): Promise<void>;
    generatePlaylistFromTelegram(telegramUrl: string, _chapterId: bigint, geminiApiKey: string): Promise<string>;
    getChaptersBySubject(subjectId: bigint): Promise<Array<Chapter>>;
    getItemsByPlaylist(playlistId: bigint): Promise<Array<PlaylistItem>>;
    getPlaylistsByChapter(chapterId: bigint): Promise<Array<Playlist>>;
    markItemStatus(itemId: bigint, isCompleted: boolean): Promise<void>;
    searchPlaylistsByName(searchText: string): Promise<Array<Playlist>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
