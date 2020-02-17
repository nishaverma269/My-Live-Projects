using EpiqsModels;
using EpiqsModels.Manufacturing.CheckRoutine;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace qms.Controllers
{
    public class PCSManagementController : BaseController
    {
        /* GET: PCSManagement */
        [QmsAuthorize(Roles = "PCSRoutineAndLocation")]
        public ActionResult Index()
        {
            ApplicationUser user = GetCurrentUser();

            //Get userId and unitId from Frontend
            ViewBag.userId = user.userId;

            //Get List of Quality Stations with given (input) userId and unitId
            ViewBag.qualityStations = JsonConvert.SerializeObject(QualityStation.Get(user.userId, user.unitId));
           
            return View();
        }
        /* Get Routines with given (input) databaseId and groupIds */
        public String GetRoutines(int databaseId, int[] groupIds)
        {
            return JsonConvert.SerializeObject(Routine.Get(databaseId, groupIds));
        }

        /* Get Frequencies with given (input) checkRoutineId, databaseId and groupIds */
        public String GetFrequencies(int checkRoutineId, int databaseId, int[] groupIds)
        {
            return JsonConvert.SerializeObject(RoutineGroupFrequency.Get(checkRoutineId, databaseId, groupIds));
        }

        /* Get Frequencies with given (input) checkRoutineId, databaseId and groupIds */
        public String GetFrequencyOrder(int databaseId, int checkRoutineFrequencyId, string[] frequencies, int[] groupIds, string[] originalFrequencies)
        {
            return JsonConvert.SerializeObject(RoutineGroupFrequencyOrder.Get(databaseId, checkRoutineFrequencyId, frequencies, groupIds, originalFrequencies));
        }
        /* Save Routine with given (input) value, userId and databaseId */
        [QmsAuthorize(Roles = "PCSRoutineAndLocation")]
        public String SaveRoutine(List<Routine> values, Guid userId, int databaseId)
        {
            return JsonConvert.SerializeObject(Routine.Save(values, userId, databaseId));
        }
    }
}
