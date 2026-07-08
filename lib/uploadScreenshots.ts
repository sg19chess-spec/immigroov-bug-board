import { supabase } from "@/lib/supabase";

export async function uploadScreenshots(files: File[]): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("bug-screenshots")
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("bug-screenshots").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
