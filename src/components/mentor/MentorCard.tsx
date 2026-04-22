import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { Mentor } from '../../types';

interface MentorCardProps {
  mentor: Mentor;
  onBook?: (mentor: Mentor) => void;
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)} ({reviewCount})</span>
    </div>
  );
}

export default function MentorCard({ mentor, onBook }: MentorCardProps) {
  return (
    <Card hover className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
          {mentor.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{mentor.name}</h3>
            {mentor.isVerified && <span title="Verified" className="text-indigo-500 text-sm">✓</span>}
          </div>
          <StarRating rating={mentor.rating} reviewCount={mentor.reviewCount} />
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">{mentor.hourlyRate} {mentor.currency}</p>
          <p className="text-xs text-gray-500">/hour</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {mentor.skills.slice(0, 4).map(s => <Badge key={s}>{s}</Badge>)}
        {mentor.skills.length > 4 && <Badge>+{mentor.skills.length - 4}</Badge>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">{mentor.sessionCount} sessions</span>
        <div className="flex gap-2">
          <Link to={`/mentors/${mentor.id}`}><Button variant="outline" size="sm">View Profile</Button></Link>
          <Button size="sm" onClick={() => onBook?.(mentor)}>Book</Button>
        </div>
      </div>
    </Card>
  );
}
