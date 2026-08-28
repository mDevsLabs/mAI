import { NextRequest, NextResponse } from 'next/server';
import { authenticateOpenAIRequest } from '@/lib/openai-auth';
import { getOpenAIModelsList } from '@/lib/openai-model-mapper';
import { OpenAIErrorResponse, OpenAIModelObject } from '@/lib/openai-types';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const auth = await authenticateOpenAIRequest(req);
  if (!auth.valid) {
    return auth.response;
  }

  const { model: requestedModel } = await params;
  const modelsList = getOpenAIModelsList();

  const found = modelsList.find(
    (m) => m.id.toLowerCase() === requestedModel.toLowerCase()
  );

  if (!found) {
    return NextResponse.json<OpenAIErrorResponse>(
      {
        error: {
          message: `The model '${requestedModel}' does not exist.`,
          type: 'invalid_request_error',
          param: 'model',
          code: 'model_not_found',
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json<OpenAIModelObject>(found);
}
