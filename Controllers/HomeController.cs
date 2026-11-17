using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OmpRfidDashboard.Models;
using OmpRfidDashboard.Services;

namespace OmpRfidDashboard.Controllers;

public class HomeController(IBayService bayService) : Controller
{
    // Bay data is live: never let the browser or a proxy reuse an old page.
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var bays = await bayService.GetBaysAsync(cancellationToken);
        var summary = BaySummaryCalculator.Calculate(bays.ToList());

        return View(DashboardViewModel.Create(bays, summary));
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(model: Activity.Current?.Id ?? HttpContext.TraceIdentifier);
    }
}
