import { supabase } from './supabaseClient';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const storageService = {
  /**
   * Tải ảnh đại diện học sinh lên Supabase Storage (Private bucket class-media)
   */
  async uploadStudentAvatar(file: File, classId: string, studentId: string): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('Dung lượng ảnh vượt quá giới hạn 5MB.');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `classes/${classId}/avatars/${studentId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('class-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Lỗi upload avatar:', uploadError);
      throw new Error(`Không thể tải ảnh đại diện lên: ${uploadError.message}`);
    }

    // Lấy Public URL hoặc Signed URL
    const { data: publicData } = supabase.storage.from('class-media').getPublicUrl(filePath);
    return publicData.publicUrl;
  },

  /**
   * Tải ảnh Banner lớp học lên Supabase Storage
   */
  async uploadClassBanner(file: File, classId: string): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('Dung lượng ảnh banner vượt quá giới hạn 5MB.');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `classes/${classId}/banners/banner-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('class-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Lỗi upload banner:', uploadError);
      throw new Error(`Không thể tải ảnh banner lên: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage.from('class-media').getPublicUrl(filePath);
    return publicData.publicUrl;
  },

  /**
   * Tải ảnh Logo Trường học lên Supabase Storage
   */
  async uploadSchoolLogo(file: File, schoolOrClassId: string): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('Dung lượng ảnh logo vượt quá giới hạn 5MB.');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `schools/${schoolOrClassId}/logo-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('class-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicData } = supabase.storage.from('class-media').getPublicUrl(filePath);
        if (publicData?.publicUrl) return publicData.publicUrl;
      }
    } catch (err) {
      console.warn('Không thể upload lên Supabase Storage, chuyển sang base64 data:', err);
    }

    // Fallback: Chuyển sang Data URL để lưu trữ và hiển thị trực tiếp
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
