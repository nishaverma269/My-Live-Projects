using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;

namespace EpiqsModels
{
    public class Favorites
    {
        #region properties
        public string url { get; set; }

        public string title { get; set; }
        #endregion

        #region behaviors
        public static List<Favorites> Get(Guid _userId)
        {
            List<Favorites> favorites = new List<Favorites>();

            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
            using (SqlCommand cmd = new SqlCommand("SELECT Url, Title From [vw_userFavorites] WHERE WhoCreated = @userId AND WhenDeleted Is Null ORDER BY whenCreated DESC;", conn))
            {
                cmd.Parameters.AddWithValue("UserId", _userId);

                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read() == true)
                    {
                        favorites.Add(new Favorites()
                        {
                            url = Convert.ToString(reader["Url"]),
                            title = Convert.ToString(reader["Title"]),
                        });
                    }
                }
                conn.Close();
            }
            return favorites;
        }

        public static bool Save(string url, string title, int actionTypeId, Guid userId)
        {
            var favSaved = false;

            using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
            using (SqlCommand cmd = new SqlCommand("Users_CreateFavorites", conn))
            {
                cmd.Parameters.AddWithValue("Url", url);
                cmd.Parameters.AddWithValue("Title", title);
                cmd.Parameters.AddWithValue("ActionTypeId", actionTypeId);
                cmd.Parameters.AddWithValue("UserId", userId);

                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows == true)
                    {
                        favSaved = true;
                    }
                }
                return favSaved;
            }
        }
        #endregion
    }
}