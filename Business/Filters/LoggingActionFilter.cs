using Microsoft.AspNetCore.Mvc.Filters;
using TayinProgrami.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using TayinProgrami.Bussines.Interfaces;

namespace TayinProgrami.Bussines.Filtres
{
    public class LoggingActionFilter : IAsyncActionFilter
    {
        private readonly ILoggerService _logger;

        public LoggingActionFilter(ILoggerService logger)
        {
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controllerName = context.Controller.GetType().Name;
            var actionName = context.ActionDescriptor.RouteValues["action"];
            var registratioNumber = (context.HttpContext.User.Identity?.Name != null ? "AB" + context.HttpContext.User.Identity.Name : "Anonymous");
            var ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString();
            ipAddress = ipAddress == "::1" ? "Localhost" : ipAddress ?? "Unknown";

            try
            {
                await _logger.LogInfoAsync(new LogEntry
                {
                    RegistratioNumber = registratioNumber,
                    ControllerName = controllerName,
                    ActionName = actionName,
                    Message = "Action started",
                    IpAddress = ipAddress
                });

                var executedContext = await next();

                if (executedContext.Exception == null)
                {
                    await _logger.LogInfoAsync(new LogEntry
                    {
                        RegistratioNumber = registratioNumber,
                        ControllerName = controllerName,
                        ActionName = actionName,
                        Message = "Action successfully completed",
                        IpAddress = ipAddress
                    });
                }
                else
                {
                    await _logger.LogErrorAsync(new LogEntry
                    {
                        RegistratioNumber = registratioNumber,
                        ControllerName = controllerName,
                        ActionName = actionName,
                        Message = "There was an error during the action",
                        Exception = executedContext.Exception.ToString(),
                        IpAddress = ipAddress
                    });

                    executedContext.ExceptionHandled = true;
                    context.Result = new ObjectResult(new { message = "Internal server error" })
                    {
                        StatusCode = 500
                    };
                }
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync(new LogEntry
                {
                    RegistratioNumber = registratioNumber,
                    ControllerName = controllerName,
                    ActionName = actionName,
                    Message = "Something went wrong in the filter",
                    Exception = ex.ToString(),
                    IpAddress = ipAddress
                });

                throw;
            }
        }

    }


}