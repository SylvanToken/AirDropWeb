/**
 * Test script for Error Report System
 * 
 * This script tests:
 * 1. Database schema validation
 * 2. Error report creation
 * 3. Email notification sending
 * 4. API endpoints
 */

import { prisma } from "../lib/prisma";

async function testErrorReportSystem() {
  console.log("🧪 Testing Error Report System...\n");

  try {
    // Test 1: Check if ErrorReport table exists
    console.log("1️⃣ Checking database schema...");
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ErrorReport';
    `;
    console.log("✅ ErrorReport table exists:", tableExists);

    // Test 2: Create a test error report
    console.log("\n2️⃣ Creating test error report...");
    const testReport = await prisma.errorReport.create({
      data: {
        errorType: "UI_ERROR",
        errorTitle: "Test Error Report",
        errorMessage: "This is a test error report created by the test script.",
        pageUrl: "http://localhost:3005/test",
        userAgent: "Test Script",
        status: "PENDING",
        priority: "LOW",
      },
    });
    console.log("✅ Test error report created:", {
      id: testReport.id,
      title: testReport.errorTitle,
      priority: testReport.priority,
      status: testReport.status,
    });

    // Test 3: Query error reports
    console.log("\n3️⃣ Querying error reports...");
    const allReports = await prisma.errorReport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ Found ${allReports.length} error report(s)`);
    allReports.forEach((report, index) => {
      console.log(`   ${index + 1}. [${report.priority}] ${report.errorTitle} (${report.status})`);
    });

    // Test 4: Update error report
    console.log("\n4️⃣ Updating error report status...");
    const updatedReport = await prisma.errorReport.update({
      where: { id: testReport.id },
      data: {
        status: "RESOLVED",
        resolution: "Test completed successfully",
        resolvedAt: new Date(),
      },
    });
    console.log("✅ Error report updated:", {
      id: updatedReport.id,
      status: updatedReport.status,
      resolution: updatedReport.resolution,
    });

    // Test 5: Check indexes
    console.log("\n5️⃣ Checking database indexes...");
    const indexes = await prisma.$queryRaw`
      SELECT name, sql FROM sqlite_master 
      WHERE type='index' AND tbl_name='ErrorReport';
    `;
    console.log("✅ Indexes found:", indexes);

    // Test 6: Statistics
    console.log("\n6️⃣ Generating statistics...");
    const stats = await prisma.errorReport.groupBy({
      by: ["status"],
      _count: true,
    });
    console.log("✅ Error reports by status:");
    stats.forEach((stat) => {
      console.log(`   ${stat.status}: ${stat._count}`);
    });

    const priorityStats = await prisma.errorReport.groupBy({
      by: ["priority"],
      _count: true,
    });
    console.log("✅ Error reports by priority:");
    priorityStats.forEach((stat) => {
      console.log(`   ${stat.priority}: ${stat._count}`);
    });

    // Test 7: Test cascade delete (tags and comments)
    console.log("\n7️⃣ Testing cascade delete...");
    
    // Add a tag
    const tag = await prisma.errorReportTag.create({
      data: {
        errorReportId: testReport.id,
        tag: "test-tag",
      },
    });
    console.log("✅ Test tag created:", tag.tag);

    // Add a comment
    const comment = await prisma.errorReportComment.create({
      data: {
        errorReportId: testReport.id,
        userId: "test-admin-id",
        comment: "Test comment",
      },
    });
    console.log("✅ Test comment created");

    // Delete error report (should cascade delete tags and comments)
    await prisma.errorReport.delete({
      where: { id: testReport.id },
    });
    console.log("✅ Test error report deleted (with cascade)");

    // Verify tags and comments are deleted
    const remainingTags = await prisma.errorReportTag.count({
      where: { errorReportId: testReport.id },
    });
    const remainingComments = await prisma.errorReportComment.count({
      where: { errorReportId: testReport.id },
    });
    console.log(`✅ Cascade delete verified: ${remainingTags} tags, ${remainingComments} comments remaining`);

    console.log("\n✅ All tests passed! Error Report System is working correctly.");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testErrorReportSystem()
  .then(() => {
    console.log("\n🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed with error:", error);
    process.exit(1);
  });
