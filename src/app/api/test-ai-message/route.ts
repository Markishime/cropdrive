import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to simulate AI Assistant messages
 * This helps verify the integration is working correctly
 * 
 * Usage: POST /api/test-ai-message
 * Body: { type: 'ANALYSIS_COMPLETE', ... }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the message format
    if (!body.type || body.type !== 'ANALYSIS_COMPLETE') {
      return NextResponse.json(
        { error: 'Invalid message type. Must be ANALYSIS_COMPLETE' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'analysisType', 'summary', 'recommendationsCount'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields,
          requiredFields 
        },
        { status: 400 }
      );
    }

    // Validate analysisType
    if (!['soil', 'leaf'].includes(body.analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysisType. Must be "soil" or "leaf"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message format is valid',
      receivedData: {
        type: body.type,
        title: body.title,
        analysisType: body.analysisType,
        summary: body.summary,
        recommendationsCount: body.recommendationsCount,
        fileUrl: body.fileUrl || null,
        hasAnalysisData: !!body.analysisData,
      },
      note: 'This endpoint only validates the format. The actual message should be sent via postMessage from the AI Assistant iframe.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Invalid request body',
        details: error.message 
      },
      { status: 400 }
    );
  }
}

/**
 * GET endpoint to return the expected message format
 */
export async function GET() {
  return NextResponse.json({
    messageFormat: {
      type: 'ANALYSIS_COMPLETE',
      title: 'string (required) - Report title',
      analysisType: "'soil' | 'leaf' (required)",
      summary: 'string (required) - Brief summary',
      recommendationsCount: 'number (required) - Number of recommendations',
      fileUrl: 'string | null (optional) - URL to uploaded file',
      analysisData: 'object | null (optional) - Full analysis data',
    },
    example: {
      type: 'ANALYSIS_COMPLETE',
      title: 'Analysis Report - 2024-01-15',
      analysisType: 'soil',
      summary: 'Soil analysis shows optimal pH levels with moderate nitrogen content.',
      recommendationsCount: 5,
      fileUrl: null,
      analysisData: {
        ph: 6.5,
        nitrogen: 2.3,
        phosphorus: 1.8,
        potassium: 2.1,
      },
    },
    howToSend: {
      fromJavaScript: "window.parent.postMessage({ type: 'ANALYSIS_COMPLETE', ... }, '*');",
      fromPython: "st.components.v1.html(f\"\"\"<script>window.parent.postMessage({json.dumps(message)}, '*');</script>\"\"\", height=0)",
      fromGradio: "Use JavaScript in your Gradio interface to send postMessage",
    },
  });
}

