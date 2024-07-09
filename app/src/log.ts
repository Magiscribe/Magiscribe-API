import config from '@config';
import pino from 'pino';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';

const log = pino({
  level: config.logLevel.toLowerCase(),
  transport:
    config.environment == 'dev'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'hostname,pid',
          },
        }
      : undefined,
});

class PinoSpanExporter implements SpanExporter {
  export(spans: ReadableSpan[]): Promise<void> {
    spans.forEach((span) => log.trace(span, 'Span exported'));
    return Promise.resolve();
  }
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

// Register server-related instrumentation
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new GraphQLInstrumentation(),
  ],
});

const tracerConfig = {
  idGenerator: new AWSXRayIdGenerator(),
  resource: Resource.default().merge(
    new Resource({
      'service.name': 'magiscribe-apollo',
    }),
  ),
};

// Initialize provider and identify this particular service
// (in this case, we're implementing a federated gateway)
const provider = new NodeTracerProvider(tracerConfig);

// A test exporter that logs spans to the console
const logExporter = new PinoSpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(logExporter));

// Set the global trace context propagator to use X-Ray formatted trace header
provider.register({
  propagator: new AWSXRayPropagator(),
});

registerInstrumentations({
  instrumentations: [new AwsInstrumentation()],
});

export default log;
