import supabase from "../config/supabase.js";

export const UploadToSupabase = async (
  buffer,
  mimeType,
  folder,
  fileName
) => {

  const filePath = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(folder)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });


  if (error) {
    throw error;
  }


  const { data } = supabase.storage
    .from(folder)
    .getPublicUrl(filePath);


  return {
    publicUrl: data.publicUrl,
    path: filePath,
  };
};
