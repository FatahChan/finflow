import { useState } from 'react';
import { Edit, Trash2, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/ui/money';
import type { ExtractedTransaction } from '@/lib/photo-processing-service';

interface PhotoReviewStepProps {
    transactions: ExtractedTransaction[];
    onTransactionsConfirmed: (transactions: ExtractedTransaction[]) => void;
    onBack: () => void;
}

export function PhotoReviewStep({
    transactions: initialTransactions,
    onTransactionsConfirmed,
    onBack
}: PhotoReviewStepProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleRemoveTransaction = (index: number) => {
        setTransactions(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditTransaction = (index: number) => {
        setEditingIndex(index);
    };

    const handleSaveEdit = (index: number, updatedTransaction: ExtractedTransaction) => {
        setTransactions(prev =>
            prev.map((transaction, i) =>
                i === index ? updatedTransaction : transaction
            )
        );
        setEditingIndex(null);
    };

    const handleConfirm = () => {
        if (transactions.length === 0) {
            return;
        }
        onTransactionsConfirmed(transactions);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-medium">Review Transactions</h3>
                </div>
                <Badge variant="secondary">
                    {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground mb-4">
                            No transactions to review. All transactions have been removed.
                        </p>
                        <Button variant="outline" onClick={onBack}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="text-sm text-muted-foreground mb-4">
                        Review the extracted transaction details below. You can edit or remove any transaction before saving.
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.map((transaction, index) => (
                            <TransactionCard
                                key={`transaction-${index.toString()}`}
                                transaction={transaction}
                                isEditing={editingIndex === index}
                                onEdit={() => {
                                    handleEditTransaction(index);
                                }}
                                onSave={(updated) => {
                                    handleSaveEdit(index, updated);
                                }}
                                onRemove={() => {
                                    handleRemoveTransaction(index);
                                }}
                                onCancelEdit={() => {
                                    setEditingIndex(null);
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex space-x-2 pt-4">
                        <Button onClick={handleConfirm} className="flex-1">
                            <Check className="h-4 w-4 mr-2" />
                            Save {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
                        </Button>
                        <Button variant="outline" onClick={onBack}>
                            Back
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

interface TransactionCardProps {
    transaction: ExtractedTransaction;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (transaction: ExtractedTransaction) => void;
    onRemove: () => void;
    onCancelEdit: () => void;
}

function TransactionCard({
    transaction,
    isEditing,
    onEdit,
    onSave,
    onRemove,
    onCancelEdit
}: TransactionCardProps) {
    const [editedTransaction, setEditedTransaction] = useState(transaction);

    const handleSave = () => {
        onSave(editedTransaction);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    if (isEditing) {
        return (
            <Card className="border-primary">
                <CardContent className="pt-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={editedTransaction.name}
                                onChange={(e) => {
                                    setEditedTransaction(prev => ({ ...prev, name: e.target.value }));
                                }}
                                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedTransaction.amount}
                                    onChange={(e) => {
                                        setEditedTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
                                    }}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={editedTransaction.type}
                                    onChange={(e) => {
                                        setEditedTransaction(prev => ({ ...prev, type: e.target.value as 'credit' | 'debit' }));
                                    }}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="debit">Debit (Expense)</option>
                                    <option value="credit">Credit (Income)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <input
                                type="text"
                                value={editedTransaction.category}
                                onChange={(e) => {
                                    setEditedTransaction(prev => ({ ...prev, category: e.target.value }));
                                }}
                                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={editedTransaction.transactionAt.split('T')[0]}
                                onChange={(e) => {
                                    setEditedTransaction(prev => ({ ...prev, transactionAt: e.target.value }));
                                }}
                                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            />
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <Button onClick={handleSave} size="sm" className="flex-1">
                                Save
                            </Button>
                            <Button variant="outline" onClick={onCancelEdit} size="sm" className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{transaction.name}</h4>
                            <Money
                                amount={transaction.amount}
                                currency="usd" // Default currency, will be handled by the transaction form
                                positive={transaction.type === "credit"}
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(transaction.transactionAt)}</span>
                            <Badge variant="secondary" className="text-xs">
                                {transaction.category}
                            </Badge>
                            <Badge variant={transaction.type === 'credit' ? 'default' : 'outline'} className="text-xs">
                                {transaction.type === 'credit' ? 'Income' : 'Expense'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEdit}
                            className="h-8 w-8"
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}