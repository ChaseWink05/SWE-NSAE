import supabase from '../utils/supabaseClient';

export const reportService = {
  // Get all reports 
  async getAllReports() {
    try {
      console.log("Fetching all reports");
      
      // Simplified query without joins that were causing errors
      const { data, error } = await supabase
        .from('animal_reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} total reports`);
      return data || [];
    } catch (error) {
      console.error("Error in getAllReports:", error);
      throw error;
    }
  },
  
  // Get reports for specific volunteer
  async getMyReports() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('animal_reports')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching my reports:", error);
        throw error;
      }
      
      // Log all unique animal types to check for mismatches
      const animalTypes = [...new Set(data.map(report => report.animal_type))];
      console.log("Animal types in database:", animalTypes);
      
      return data || [];
    } catch (error) {
      console.error("Error in getMyReports:", error);
      throw error;
    }
  },
  
  // Create new report without worrying about policies
  async createReport(reportData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // First create the record without image
      const { data, error } = await supabase
        .from('animal_reports')
        .insert({
          animal_type: reportData.animalType,
          location: reportData.location,
          description: reportData.description,
          volunteer_id: user.id,
          health_status: reportData.healthStatus,
          medical_needs: reportData.medicalNeeds
        })
        .select();
      
      if (error) {
        console.error("Error creating report:", error);
        throw error;
      }
      
      // If there's an image file, handle it separately
      if (reportData.imageFile && data[0]) {
        await handleImageUpload(reportData.imageFile, data[0].id);
      }
      
      return data[0];
    } catch (error) {
      console.error("Error in createReport:", error);
      throw error;
    }
  },
  
  // Update report
async updateReport(reportId, updates) {
  console.log("Updating report:", reportId, updates);
  
  try {
    const { data, error } = await supabase
      .from('animal_reports')
      .update({
        animal_type: updates.animalType || updates.animal_type,
        location: updates.location,
        description: updates.description
      })
      .eq('id', reportId)
      .select();
      
    if (error) {
      console.error("Error updating report:", error);
      throw error;
    }
    
    console.log("Update successful:", data);
    return data[0];
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
},

// Delete report
async deleteReport(reportId) {
  console.log("Deleting report:", reportId);
  
  try {
    const { error } = await supabase
      .from('animal_reports')
      .delete()
      .eq('id', reportId);
      
    if (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
    
    console.log("Delete successful");
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
},
  
  // Update report status (for caregivers)
  async reviewReport(reportId, status, notes) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('animal_reports')
      .update({
        status: status,
        caregiver_notes: notes,
        caregiver_id: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select();
      
    if (error) {
      console.error("Error updating status:", error);
      throw error;
    }
    return data[0];
  },
  async getReportsByAnimalType(animalType) {
    try {
      console.log(`Filtering reports for animal type: ${animalType}`);
      
      // Get reports filtered by animal type
      const { data, error } = await supabase
        .from('animal_reports')
        .select('*')
        .eq('animal_type', animalType)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error in getReportsByAnimalType:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} reports for ${animalType}`);
      return data || [];
    } catch (error) {
      console.error("Error fetching reports by animal type:", error);
      throw error;
    }
  }
};


// Helper function for image upload
async function handleImageUpload(imageFile, reportId) {
  try {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${reportId}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase
      .storage
      .from('animal-reports')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data } = supabase
      .storage
      .from('animal-reports')
      .getPublicUrl(filePath);
    
    // Update the report with the image URL
    await supabase
      .from('animal_reports')
      .update({ image_url: data.publicUrl })
      .eq('id', reportId);
      
  } catch (error) {
    console.error("Error uploading image:", error);
    // We continue without the image if upload fails
  }
}



export default reportService;