import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { InvitationPreview } from "./InvitationPreview.jsx";
import { TEMPLATES } from "../templates.js";
import {
	createInvitationOnServer,
	parseGuestList,
} from "../invitationLogic.js";

const defaultEvent = {
	eventTitle: "Thiệp mời sinh nhật",
	hostMessage:
		"Gia đình chúng tôi trân trọng kính mời bạn đến tham dự buổi tiệc nhỏ cùng chúng tôi.",
	dateTime: "",
	location: "",
	note: "",
	imageUrl: "",
};

export function HostPage() {
	const location = useLocation();
	const [templateId, setTemplateId] = useState("classic");
	const [event, setEvent] = useState(defaultEvent);
	const [guestListText, setGuestListText] = useState("");
	const [generatedLink, setGeneratedLink] = useState("");
	const [pageIndex, setPageIndex] = useState(0);
	const [guestImages, setGuestImages] = useState({});

	const parsedGuests = useMemo(
		() => parseGuestList(guestListText),
		[guestListText],
	);

	const currentGuestForPreview = useMemo(() => {
		if (!parsedGuests.length) {
			return { display: "<tên khách / số thứ tự>" };
		}
		const g = parsedGuests[0];
		return { display: `${g.name} (${g.id})` };
	}, [parsedGuests]);

	const baseUrl = useMemo(() => {
		if (typeof window === "undefined") return "";
		const origin =
			window.location.origin === "null"
				? "http://localhost:3000"
				: window.location.origin;
		return origin;
	}, [location]);

	const handleEventChange = (key) => (e) => {
		const value = e.target.value;
		setEvent((prev) => ({ ...prev, [key]: value }));
	};

	const handleGuestImageChange = (id) => (e) => {
		const value = e.target.value;
		setGuestImages((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const downloadConfigFile = (invitationId, config) => {
		try {
			const blob = new Blob(
				[JSON.stringify({ id: invitationId, ...config }, null, 2)],
				{ type: "application/json" },
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `invitation-${invitationId}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			// ignore lỗi download, không chặn luồng chính
		}
	};

	const handleGenerateLink = async () => {
		const config = {
			t: templateId,
			e: event,
			g: parsedGuests.map(({ id, name }) => ({
				id,
				name,
				imageUrl: guestImages[id] || "",
			})),
		};

		try {
			// Tạo thiệp trên server, server sẽ lưu xuống file JSON local
			const result = await createInvitationOnServer(config);
			const invitationId =
				result?.id || Math.random().toString(36).slice(2, 8);

			// Hiển thị mã thiệp để Host biết gửi cho Guest
			setGeneratedLink(invitationId);
		} catch (err) {
			console.error(err);
			alert("Không lưu được thiệp lên server. Vui lòng thử lại.");
		}
	};

	const handleImportFile = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const text = reader.result?.toString() || "";
				const data = JSON.parse(text);

				const importedId =
					data.id || Math.random().toString(36).slice(2, 8);
				const importedTemplateId =
					data.t && TEMPLATES[data.t] ? data.t : "classic";
				const importedEvent = {
					...defaultEvent,
					...(data.e || {}),
				};
				const importedGuests = Array.isArray(data.g) ? data.g : [];
				const guestLines = importedGuests
					.map((g) => {
						if (!g || typeof g !== "object") return "";
						if (!g.id || !g.name) return "";
						return `${g.id} - ${g.name}`;
					})
					.filter(Boolean)
					.join("\n");

				setTemplateId(importedTemplateId);
				setEvent(importedEvent);
				setGuestListText(guestLines);
				setGuestImages(
					importedGuests.reduce((acc, g) => {
						if (g && g.id && g.imageUrl) {
							acc[g.id] = g.imageUrl;
						}
						return acc;
					}, {}),
				);
				setPageIndex(0);

				const config = {
					t: importedTemplateId,
					e: importedEvent,
					g: importedGuests.map(({ id, name, imageUrl }) => ({
						id,
						name,
						imageUrl: imageUrl || "",
					})),
				};
				// Gửi lại config này lên server để lưu xuống file JSON local của server
				createInvitationOnServer(config)
					.then((result) => {
						const invitationId = result?.id || importedId;
						setGeneratedLink(invitationId);
						alert(
							`Đã nhập thiệp từ file JSON và lưu lại trên server. Mã thiệp: ${invitationId}`,
						);
					})
					.catch(() => {
						setGeneratedLink(importedId);
						alert(
							`Đã đọc file JSON nhưng không lưu được lên server. Mã thiệp: ${importedId} (nếu thiệp đã tồn tại trên server).`,
						);
					});
			} catch {
				alert("File không đúng định dạng thiệp (JSON).");
			} finally {
				// reset input để có thể chọn lại cùng file nếu cần
				e.target.value = "";
			}
		};
		reader.onerror = () => {
			alert("Không đọc được file, vui lòng thử lại.");
			e.target.value = "";
		};

		reader.readAsText(file, "utf-8");
	};

	const handleCopy = async () => {
		if (!generatedLink) return;
		try {
			await navigator.clipboard.writeText(generatedLink);
			alert("Đã copy mã thiệp vào clipboard.");
		} catch {
			alert("Không copy được, hãy copy tay từ khung hiển thị.");
		}
	};

	const template = TEMPLATES[templateId] || TEMPLATES.classic;

	const goPrevPage = () => {
		setPageIndex((prev) => Math.max(prev - 1, 0));
	};

	const goNextPage = () => {
		setPageIndex((prev) => Math.min(prev + 1, template.pageCount - 1));
	};

	return (
		<div className="app-shell">
			<header style={{ marginBottom: 20 }}>
				<h1 className="app-header-title">
					Invitation Card Generator – SPA
				</h1>
				<p className="app-header-subtitle">
					Host cấu hình thiệp, hệ thống sinh link thiệp chung; khách
					nhập tên hoặc mã để xem thiệp cá nhân hoá.
				</p>
			</header>

			<div className="card">
				<h2>Khu vực Host – cấu hình thiệp</h2>
				<small>
					Chọn template, nhập thông tin sự kiện & (tuỳ chọn) danh sách
					khách. Sau đó nhấn "Generate link" để lấy link gửi cho
					khách.
				</small>

				<div className="grid">
					<div>
						<div className="field">
							<label htmlFor="template">Mẫu thiệp</label>
							<select
								id="template"
								value={templateId}
								onChange={(e) => {
									setTemplateId(e.target.value);
									setPageIndex(0);
								}}
							>
								{Object.values(TEMPLATES).map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
							<small>
								Mỗi template có số trang & phong cách hiển thị
								khác nhau.
							</small>
						</div>

						<div className="field">
							<label htmlFor="eventTitle">Tiêu đề sự kiện</label>
							<input
								id="eventTitle"
								type="text"
								placeholder="Thiệp mời sinh nhật..."
								value={event.eventTitle}
								onChange={handleEventChange("eventTitle")}
							/>
						</div>

						<div className="field">
							<label htmlFor="hostMessage">Lời mời chung</label>
							<textarea
								id="hostMessage"
								placeholder="Gia đình chúng tôi trân trọng kính mời..."
								value={event.hostMessage}
								onChange={handleEventChange("hostMessage")}
							/>
						</div>

						<div className="field">
							<label htmlFor="datetime">Thời gian</label>
							<input
								id="datetime"
								type="text"
								placeholder="19:00 - 20/04/2026"
								value={event.dateTime}
								onChange={handleEventChange("dateTime")}
							/>
						</div>

						<div className="field">
							<label htmlFor="location">Địa điểm</label>
							<input
								id="location"
								type="text"
								placeholder="Nhà hàng / Địa chỉ cụ thể"
								value={event.location}
								onChange={handleEventChange("location")}
							/>
						</div>

						<div className="field">
							<label htmlFor="note">Ghi chú (tùy chọn)</label>
							<textarea
								id="note"
								placeholder="Dress code, lưu ý đỗ xe, thông tin liên hệ..."
								value={event.note}
								onChange={handleEventChange("note")}
							/>
						</div>

						<div className="field">
							<label htmlFor="imageUrl">
								Link ảnh (tùy chọn)
							</label>
							<input
								id="imageUrl"
								type="text"
								placeholder="https://... ảnh nền hoặc ảnh nhân vật"
								value={event.imageUrl}
								onChange={handleEventChange("imageUrl")}
							/>
							<small>
								Nếu nhập link ảnh hợp lệ, ảnh sẽ hiển thị ở đầu
								thiệp (có thể là ảnh chủ nhân buổi tiệc, ảnh
								minh hoạ, v.v.).
							</small>
						</div>

						<div className="field">
							<label htmlFor="guestList">
								Danh sách khách mời (mã - tên, tuỳ chọn)
							</label>
							<textarea
								id="guestList"
								placeholder={`Ví dụ:
001 - Nguyễn Văn A
002 - Trần Thị B
VIP01 - Gia đình C`}
								value={guestListText}
								onChange={(e) =>
									setGuestListText(e.target.value)
								}
							/>
							<small>
								Mỗi dòng một khách, có thể dùng dấu{" "}
								<strong>-</strong>, <strong>|</strong> hoặc
								khoảng trắng để ngăn cách mã và tên. Khách có
								thể nhập <strong>mã</strong> hoặc{" "}
								<strong>tên</strong> để xem đúng thiệp của mình.
							</small>
						</div>

						{parsedGuests.length > 0 && (
							<div className="field">
								<label>Ảnh cho từng khách (tùy chọn)</label>
								<small>
									Nếu bạn có ảnh riêng cho từng khách, hãy
									nhập link ảnh tương ứng. Nếu bỏ trống, thiệp
									sẽ dùng ảnh chung (nếu có) hoặc không hiển
									thị ảnh.
								</small>
								{parsedGuests.map((g) => (
									<div
										key={g.id}
										className="field"
										style={{
											marginTop: "4px",
											marginBottom: "4px",
										}}
									>
										<small>
											<strong>{g.id}</strong> – {g.name}
										</small>
										<input
											type="text"
											placeholder="https://... ảnh cho khách này"
											value={guestImages[g.id] || ""}
											onChange={handleGuestImageChange(
												g.id,
											)}
										/>
									</div>
								))}
							</div>
						)}

						<div className="btn-row">
							<button
								className="btn"
								type="button"
								onClick={handleGenerateLink}
							>
								Tạo thiệp
							</button>
							<span className="note">
								Sau khi tạo, bạn sẽ nhận được{" "}
								<strong>mã thiệp</strong> để gửi cho khách mời.
								Khách mời nhập mã thiệp và mã khách của họ để
								xem thiệp.
							</span>
						</div>

						<div className="field" style={{ marginTop: 12 }}>
							<label htmlFor="importJson">
								Hoặc nhập thiệp từ file JSON
							</label>
							<input
								id="importJson"
								type="file"
								accept="application/json"
								onChange={handleImportFile}
							/>
							<small>
								Chọn file <code>invitation-*.json</code> đã tải
								trước đó để khôi phục lại cấu hình thiệp.
							</small>
						</div>

						{generatedLink && (
							<div className="link-box" style={{ marginTop: 8 }}>
								<div style={{ marginBottom: 8 }}>
									<strong>Mã thiệp của bạn:</strong>{" "}
									<code>{generatedLink}</code>
								</div>
								<div
									style={{
										fontSize: "0.9em",
										color: "#6b7280",
										marginBottom: 8,
									}}
								>
									Gửi mã thiệp này cho khách mời. Họ sẽ nhập
									mã thiệp và mã khách của họ để xem thiệp.
								</div>
								<button
									type="button"
									className="btn-ghost"
									onClick={handleCopy}
								>
									Copy mã thiệp
								</button>
							</div>
						)}
					</div>

					<div>
						<InvitationPreview
							templateId={templateId}
							pageIndex={pageIndex}
							eventData={event}
							guest={currentGuestForPreview}
						/>
						<div
							className="btn-row"
							style={{
								justifyContent: "space-between",
								marginTop: 8,
							}}
						>
							<div>
								<button
									type="button"
									className="btn-ghost"
									onClick={goPrevPage}
									disabled={pageIndex === 0}
								>
									◀ Trang trước
								</button>
								<button
									type="button"
									className="btn-ghost"
									onClick={goNextPage}
									disabled={
										pageIndex === template.pageCount - 1
									}
									style={{ marginLeft: 8 }}
								>
									Trang sau ▶
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
