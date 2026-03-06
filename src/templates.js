export const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic – 1 trang',
    pageCount: 1,
    renderPage: (pageIndex, { event, guest }) => {
      return {
        tagline: 'Thiệp mời sự kiện',
        title: event.eventTitle || 'Thiệp mời sự kiện',
        invitee:
          guest.display ||
          'Gửi: <tên khách / số thứ tự>',
        hostMessage:
          event.hostMessage ||
          'Gia đình chúng tôi trân trọng kính mời bạn đến tham dự buổi tiệc nhỏ cùng chúng tôi.',
        datetime: event.dateTime
          ? 'Thời gian: ' + event.dateTime
          : '',
        location: event.location
          ? 'Địa điểm: ' + event.location
          : '',
        note: event.note || '',
        heroImageUrl: event.imageUrl || undefined,
        avatarImageUrl: guest.imageUrl || undefined,
        background:
          'linear-gradient(135deg, #fef3c7 0%, #fee2e2 40%, #e0f2fe 100%)',
      };
    },
  },
  storybook: {
    id: 'storybook',
    name: 'Storybook – 2 trang',
    pageCount: 2,
    renderPage: (pageIndex, { event, guest }) => {
      const safeName = guest.display || 'người bạn thân mến';
      if (pageIndex === 0) {
        const base = {
          tagline: 'Chương 1 · Lời mời',
          title: event.eventTitle || 'Bắt đầu một câu chuyện',
          invitee: 'Gửi ' + safeName,
          hostMessage:
            event.hostMessage ||
            'Mỗi khoảnh khắc đẹp đều đáng được kể lại. Chúng tôi mong được chia sẻ cùng bạn.',
          datetime: event.dateTime
            ? 'Thời gian: ' + event.dateTime
            : '',
          location: event.location
            ? 'Địa điểm: ' + event.location
            : '',
          note:
            event.note ||
            'Lật sang trang tiếp theo để xem thêm chi tiết về buổi tiệc.',
          heroImageUrl: event.imageUrl || undefined,
          avatarImageUrl: guest.imageUrl || undefined,
        };
        return {
          ...base,
          background:
            'linear-gradient(135deg, #eef2ff 0%, #fdf2ff 45%, #ecfeff 100%)',
        };
      }
      const nameShort = guest.display || 'bạn';
      const base = {
        tagline: 'Chương 2 · Hẹn gặp',
        title: 'Hẹn gặp ' + nameShort,
        invitee: '',
        hostMessage:
          'Chúng tôi rất mong nhận được hồi âm và sự hiện diện của bạn trong buổi tiệc này.',
        datetime: event.dateTime
          ? 'Thời gian: ' + event.dateTime
          : 'Thời gian sẽ được cập nhật.',
        location: event.location
          ? 'Địa điểm: ' + event.location
          : 'Địa điểm sẽ được thông báo sau.',
        note:
          event.note ||
          'Nếu cần hỗ trợ thêm, hãy liên hệ trực tiếp với chúng tôi.',
        heroImageUrl: event.imageUrl || undefined,
        avatarImageUrl: guest.imageUrl || undefined,
      };
      return {
        ...base,
        background:
          'linear-gradient(135deg, #eef2ff 0%, #fdf2ff 45%, #ecfeff 100%)',
      };
    },
  },
  womensDay: {
    id: 'womensDay',
    name: 'Ngày Quốc tế Phụ nữ – 1 trang',
    pageCount: 1,
    renderPage: (pageIndex, { event, guest }) => {
      return {
        tagline: 'Ngày Quốc tế Phụ nữ 8/3',
        title: event.eventTitle || 'Chúc mừng Ngày Quốc tế Phụ nữ',
        invitee:
          guest.display ||
          'Gửi: <tên khách / số thứ tự>',
        hostMessage:
          event.hostMessage ||
          'Nhân ngày Quốc tế Phụ nữ 8/3, chúng tôi trân trọng kính mời bạn đến tham dự buổi tiệc nhỏ để cùng tôn vinh và tri ân những người phụ nữ tuyệt vời.',
        datetime: event.dateTime
          ? 'Thời gian: ' + event.dateTime
          : '',
        location: event.location
          ? 'Địa điểm: ' + event.location
          : '',
        note: event.note || 'Rất mong nhận được sự hiện diện của bạn!',
        heroImageUrl: event.imageUrl || undefined,
        avatarImageUrl: guest.imageUrl || undefined,
        // Nền nhiều lớp với mảng hoa (hồng) và lá (xanh) ở các góc
        background:
          'radial-gradient(circle at top left, rgba(254, 202, 232, 0.9) 0, rgba(254, 202, 232, 0) 55%),' +
          'radial-gradient(circle at top right, rgba(254, 249, 195, 0.85) 0, rgba(254, 249, 195, 0) 55%),' +
          'radial-gradient(circle at bottom left, rgba(187, 247, 208, 0.9) 0, rgba(187, 247, 208, 0) 55%),' +
          'radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.9) 0, rgba(167, 243, 208, 0) 55%),' +
          'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 50%, #f472b6 75%, #ec4899 100%)',
      };
    },
  },
};

