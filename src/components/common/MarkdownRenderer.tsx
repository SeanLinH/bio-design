import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, styled } from '@mui/material';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Styled components for markdown elements
const StyledMarkdownBox = styled(Box)(({ theme }) => ({
  '& h1': {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
  },
  '& h2': {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
    color: theme.palette.text.primary,
  },
  '& h3': {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  '& h4, & h5, & h6': {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
  '& p': {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    wordWrap: 'break-word',
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1),
    '& li': {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.primary,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    marginBottom: theme.spacing(1),
    fontStyle: 'italic',
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    '& p': {
      marginBottom: 0,
    },
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.error.main,
    padding: theme.spacing(0.25, 0.5),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.8rem',
    fontFamily: '"Roboto Mono", "Courier New", monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    marginBottom: theme.spacing(1),
    '& code': {
      backgroundColor: 'transparent',
      color: 'inherit',
      padding: 0,
      fontSize: '0.8rem',
    },
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: theme.palette.grey[100],
      fontWeight: 600,
    },
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
  },
  '& hr': {
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(2, 0),
  },
  // Handle nested lists
  '& ul ul, & ol ol, & ul ol, & ol ul': {
    marginTop: theme.spacing(0.5),
    marginBottom: 0,
  },
  // Handle task lists (GFM)
  '& input[type="checkbox"]': {
    marginRight: theme.spacing(1),
  },
}));

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false
}) => {
  // For streaming content, we might need to handle incomplete markdown
  const processedContent = React.useMemo(() => {
    if (!content) return '';

    // If streaming and content ends abruptly, we might want to add some handling
    // For now, just return the content as-is since react-markdown handles partial content well
    return content;
  }, [content]);

  return (
    <StyledMarkdownBox>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom renderers for specific elements if needed
          p: ({ children }) => (
            <Typography variant="body2" component="p" sx={{
              marginBottom: 1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {children}
            </Typography>
          ),
          // Handle code blocks
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <Typography
                  component="code"
                  variant="body2"
                  sx={{
                    backgroundColor: 'grey.100',
                    color: 'error.main',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.8rem',
                    fontFamily: '"Roboto Mono", "Courier New", monospace',
                  }}
                  {...props}
                >
                  {children}
                </Typography>
              );
            }

            return (
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.900',
                  color: 'common.white',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  mb: 1,
                  fontSize: '0.8rem',
                  fontFamily: '"Roboto Mono", "Courier New", monospace',
                }}
              >
                <code {...props}>{children}</code>
              </Box>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
      {isStreaming && (
        <Typography
          component="span"
          sx={{
            animation: 'blink 1s infinite',
            color: 'primary.main',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          |
        </Typography>
      )}
    </StyledMarkdownBox>
  );
};

export default MarkdownRenderer;